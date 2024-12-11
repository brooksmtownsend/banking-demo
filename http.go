package main

import (
	"net/http"

	// Generated interfaces

	"github.com/julienschmidt/httprouter"
)

// Router creates a [http.Handler] and registers the application-specific
// routes with their respective handlers for the application.
func Router() http.Handler {
	router := httprouter.New()
	// OAuth2 handlers
	// GET  /login                -> Initiates OAuth flow
	// GET  /callback             -> Handles OAuth callback
	router.HandlerFunc(http.MethodGet, "/login", loginHandler)
	router.HandlerFunc(http.MethodGet, "/oauth/callback", callbackHandler)

	// Account handlers
	// TODO: all endpoints gotta be authenticated
	// GET  /accounts             -> Lists user account IDs
	// POST /accounts             -> Creates a new account
	// GET  /accounts/:id/balance -> Retrieves balance for a specific account
	// POST /accounts/:id/deposit -> Deposits money into an account
	// POST /accounts/:id/withdraw -> Withdraws money from an account
	// GET  /accounts/:id/transactions -> Retrieves transaction history
	router.HandlerFunc(http.MethodGet, "/accounts", accountsHandler)
	router.HandlerFunc(http.MethodPost, "/accounts", newAccountHandler)
	router.HandlerFunc(http.MethodGet, "/accounts/:id/balance", accountsHandler)
	router.HandlerFunc(http.MethodPost, "/accounts/:id/deposit", accountsHandler)
	router.HandlerFunc(http.MethodPost, "/accounts/:id/withdraw", accountsHandler)
	router.HandlerFunc(http.MethodGet, "/accounts/:id/transactions", accountsHandler)
	return router
}
