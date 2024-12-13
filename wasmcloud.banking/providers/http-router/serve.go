package main

import (
	"log/slog"
	"net/http"

	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"

	resizer "github.com/cosmonic-labs/wasmcloud.space/providers/http-router/bindings/demo/image_processor/resizer"
)

type ServeProxy struct {
	tracer trace.Tracer
	server *Server
}

func (t *ServeProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx, span := t.tracer.Start(r.Context(), "ServeHTTP")
	defer span.End()

	assetKey := r.PathValue("asset")

	if assetKey == "" {
		http.Error(w, "Missing asset key", http.StatusBadRequest)
		return
	}

	client := t.server.WRPCClient("demo", "image-processor")

	res, err := resizer.Serve(ctx, client, assetKey)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		slog.Error("error calling resizer.Serve", slog.Any("error", err))
		return
	}

	if res.Err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		slog.Error("resizer.Serve returned error", slog.String("error", *res.Err))
		return
	}

	w.Write(*res.Ok)

	span.SetStatus(codes.Ok, "Served Request")
}
