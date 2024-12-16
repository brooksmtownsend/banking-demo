package main

import (
	"embed"
	"encoding/json"
	"io/fs"
	"net/http"

	// Generated interfaces

	"github.com/julienschmidt/httprouter"
)

//go:embed wasmcloud.banking/client/apps/banking/dist
var staticAssets embed.FS

// Router creates a [http.Handler] and registers the application-specific
// routes with their respective handlers for the application.
func Router() http.Handler {
	router := httprouter.New()
	// OAuth2 handlers
	// GET  /login                -> Initiates OAuth flow
	// GET  /callback             -> Handles OAuth callback
	router.GET("/login", loginHandler)
	router.GET("/oauth/callback", callbackHandler)

	// Account handlers
	// TODO: all endpoints gotta be authenticated
	// POST /accounts             -> Creates a new account
	// GET  /accounts/:id/info -> Retrieves account information
	// GET  /accounts/:id/transactions -> Retrieves account transaction history
	// POST /accounts/:id/transactions -> Post a transaction
	router.POST("/accounts/:id", newAccountHandler)
	router.GET("/accounts/:id/info", accountInfoHandler)
	router.GET("/accounts/:id/transactions", getTransactionsHandler)
	router.POST("/accounts/:id/transactions", postTransactionHandler)
	router.GET("/", assetHandler)
	router.GET("/assets/*asset", assetHandler)
	router.GET("/images/*image", assetHandler)
	return router
}

func assetHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	assets, err := fs.Sub(staticAssets, "wasmcloud.banking/client/apps/banking/dist")
	if err != nil {
		http.Error(w, "Couldn't find static assets", http.StatusInternalServerError)
		return
	}
	fs := http.FileServer(http.FS(assets))
	http.StripPrefix("/", fs).ServeHTTP(w, r)
}

type SuccessResponse struct {
	Data interface{} `json:"data"`
}

func successResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{Data: data})
}
