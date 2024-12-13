//go:generate wit-bindgen-wrpc go --out-dir bindings --package github.com/cosmonic-labs/wasmcloud.space/providers/http-router/bindings wit

package main

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"sync"
	"syscall"
	"time"

	"github.com/gorilla/handlers"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"go.wasmcloud.dev/provider"
	wrpcnats "wrpc.io/go/nats"
)

//go:embed apps
var staticAssets embed.FS

var currentUiConfig = uiConfig{
	BaseURL: "/",
	Theme:   "space",
	AppName: "WAwesomeCloud",
	ApiPaths: apiPaths{
		Task:   "/api/tasks/:id",
		Tasks:  "/api/tasks",
		Upload: "/api/analyze",
	},
}

type Server struct {
	provider   *provider.WasmcloudProvider
	httpServer *http.Server
	tracer     trace.Tracer
	links      sync.Map
}

func (s *Server) HealthCheck() string {
	return "healthy"
}

func (s *Server) WRPCClient(namespace string, pkg string) *wrpcnats.Client {
	var target string
	if linkTarget, ok := s.links.Load(fmt.Sprintf("%s:%s", namespace, pkg)); ok {
		target = linkTarget.(string)
	}
	return s.provider.OutgoingRpcClient(target)
}

func (s *Server) Shutdown() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.httpServer.Shutdown(ctx)
}

func (s *Server) SourceLinkPut(link provider.InterfaceLinkDefinition) error {
	targetName := fmt.Sprintf("%s:%s", link.WitNamespace, link.WitPackage)
	targetValue := link.Target

	if link.WitNamespace == "demo" {
		switch link.WitPackage {
		case "image-processor", "image-analyzer", "task-manager":
			slog.Info("Setting link", slog.String("package", targetName), slog.String("target", targetValue))
			s.links.Store(targetName, targetValue)
		}
	}

	return nil
}

type uiConfig struct {
	Theme         string   `json:"theme"`
	BaseURL       string   `json:"baseUrl"`
	AppName       string   `json:"appName"`
	ApiPaths      apiPaths `json:"apiPaths"`
	adminPassword *string  `json:"-"`
}

type apiPaths struct {
	Task   string `json:"task"`
	Tasks  string `json:"tasks"`
	Upload string `json:"upload"`
}

func run() error {
	server := &Server{
		tracer: otel.Tracer("http-router"),
	}

	p, err := provider.New(
		provider.HealthCheck(func() string {
			return server.HealthCheck()
		}),
		provider.Shutdown(func() error {
			return server.Shutdown()
		}),
		provider.SourceLinkPut(func(link provider.InterfaceLinkDefinition) error {
			if secret, ok := link.TargetSecrets["admin-password"]; ok {
				slog.Info("Setting admin password")
				password := secret.String.Reveal()
				currentUiConfig.adminPassword = &password
			}

			return server.SourceLinkPut(link)
		}),
	)
	if err != nil {
		return err
	}
	server.provider = p

	var port int
	if rawServerPort, ok := p.HostData().Config["port"]; !ok {
		slog.Error("Port not specified in 'provider_config'")
		os.Exit(1)
	} else {
		if port, err = strconv.Atoi(rawServerPort); err != nil {
			slog.Error("Couldn't parse desired port number", slog.String("requested_port", rawServerPort))
			os.Exit(1)
		}
	}

	if theme, ok := p.HostData().Config["theme"]; ok {
		currentUiConfig.Theme = theme
	}

	assets, err := fs.Sub(staticAssets, "apps/"+currentUiConfig.Theme+"/dist")
	if err != nil {
		slog.Error("Couldn't find static assets", slog.Any("error", err))
		os.Exit(1)
	}

	mux := http.NewServeMux()
	tasksProxy := &TasksProxy{server: server, tracer: otel.Tracer("tasks-proxy")}
	processProxy := &ProcessProxy{server: server, tracer: otel.Tracer("process-proxy")}
	serveProxy := &ServeProxy{server: server, tracer: otel.Tracer("statistics-proxy")}
	mux.Handle("/config.json", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { json.NewEncoder(w).Encode(currentUiConfig) }))
	mux.Handle("/api/tasks", tasksProxy)
	mux.Handle("/api/auth", authMiddleware(tasksProxy))
	mux.Handle("/api/tasks/{id...}", tasksProxy)
	mux.Handle("/api/analyze", determineGeoIP(processProxy))
	mux.Handle("/api/blob/{asset...}", serveProxy)

	fs := http.FileServer(http.FS(assets))
	mux.Handle("/", http.StripPrefix("/", fs))

	httpHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST"}),
		handlers.AllowedHeaders([]string{"Content-Type"}),
	)(mux)
	// Reads X-Forwarded-* headers
	if serverMode, ok := p.HostData().Config["mode"]; ok {
		if serverMode == "behind_proxy" {
			httpHandler = handlers.ProxyHeaders(httpHandler)
		}
	}

	if baseUrl, ok := p.HostData().Config["baseUrl"]; ok {
		currentUiConfig.BaseURL = baseUrl
	}

	if appName, ok := p.HostData().Config["appName"]; ok {
		currentUiConfig.AppName = appName
	}

	server.httpServer = &http.Server{
		Handler: httpHandler,
		Addr:    fmt.Sprintf(":%d", port),
	}

	go func() {
		server.httpServer.ListenAndServe()
	}()

	providerCh := make(chan error, 1)
	signalCh := make(chan os.Signal, 1)

	go func() {
		err := p.Start()
		providerCh <- err
	}()

	signal.Notify(signalCh, syscall.SIGINT)

	select {
	case err = <-providerCh:
		return err
	case <-signalCh:
		p.Shutdown()
	}

	return nil
}

func main() {
	if err := run(); err != nil {
		slog.Error("Couldn't run server", slog.Any("error", err))
		os.Exit(1)
	}
}

type geoIPResponse struct {
	Lat         float64 `json:"lat"`
	Lon         float64 `json:"lon"`
	ASN         string  `json:"as"`
	Country     string  `json:"country"`
	CountryCode string  `json:"countryCode"`
	Region      string  `json:"region"`
	RegionName  string  `json:"regionName"`
}

type geoKey string

const geoContextKey = geoKey("geo")

func geoIP(ctx context.Context) (geoIPResponse, bool) {
	v, ok := ctx.Value(geoContextKey).(geoIPResponse)
	return v, ok
}

func authMiddleware(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if currentUiConfig.adminPassword == nil {
			http.Error(w, "Password not configured", http.StatusUnauthorized)
			return
		}
		if r.FormValue("password") != *currentUiConfig.adminPassword {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	}
}

func determineGeoIP(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		requestURL := fmt.Sprintf("http://ip-api.com/json/%s", r.RemoteAddr)
		slog.Info("Querying", slog.String("url", requestURL))
		req, err := http.NewRequest(http.MethodGet, requestURL, nil)
		if err != nil {
			slog.Error("Couldn't identify request", slog.Any("error", err))
			next.ServeHTTP(w, r)
			return
		}

		res, err := http.DefaultClient.Do(req)
		if err != nil {
			slog.Error("Couldn't identify request", slog.Any("error", err))
			next.ServeHTTP(w, r)
			return
		}

		if res.StatusCode != http.StatusOK {
			slog.Error("Couldn't identify request", slog.String("error", "invalid http status"))
			next.ServeHTTP(w, r)
			return
		}
		defer res.Body.Close()

		var geo geoIPResponse
		err = json.NewDecoder(res.Body).Decode(&geo)
		if err != nil {
			slog.Error("Couldn't identify request", slog.Any("error", err))
			next.ServeHTTP(w, r)
			return
		}

		r = r.WithContext(context.WithValue(r.Context(), geoContextKey, geo))
		next.ServeHTTP(w, r)
	}
}
