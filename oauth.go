//go:generate go run go.bytecodealliance.org/cmd/wit-bindgen-go generate --world banking --out gen ./wit
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	// Generated interfaces

	"github.com/brooksmtownsend/multitiersecurity/gen/wasmcloud/secrets/reveal"
	secretstore "github.com/brooksmtownsend/multitiersecurity/gen/wasmcloud/secrets/store"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

// loginHandler initiates the OAuth flow by redirecting the user to the OAuth provider's login page.
func loginHandler(w http.ResponseWriter, r *http.Request) {
	oauthConfig, err := oauthConfig()
	if err != nil {
		http.Error(w, "Failed to get OAuth config: "+err.Error(), http.StatusInternalServerError)
		return
	}
	url := oauthConfig.AuthCodeURL("state", oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// callbackHandler handles the GitHub callback and exchanges the authorization code for an access token.
func callbackHandler(w http.ResponseWriter, r *http.Request) {
	oauthConfig, err := oauthConfig()
	if err != nil {
		http.Error(w, "Failed to get OAuth config: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the authorization code from the URL query parameters
	code := r.FormValue("code")

	// Use custom HTTP client for token exchange
	ctx := context.WithValue(context.Background(), oauth2.HTTPClient, httpClient)
	token, err := oauthConfig.Exchange(ctx, code)
	if err != nil {
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Use token to make authenticated requests with custom HTTP client
	client := oauthConfig.Client(ctx, token)
	userInfo, err := getUserInfo(client)
	if err != nil {
		http.Error(w, "Failed to get user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Print user information
	fmt.Fprintf(w, "User Info: %s\n", userInfo)
}

// getUserInfo fetches user information from GitHub's API using the authenticated client.
func getUserInfo(client *http.Client) (string, error) {
	req, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return "", fmt.Errorf("creating request: %w", err)
	}

	// Add required headers
	req.Header.Set("User-Agent", "Go-HTTP-Client/Multitier-Security-Example")
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	// Check status code
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	var userInfo map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return "", fmt.Errorf("decoding response: %w", err)
	}

	userInfoJSON, err := json.MarshalIndent(userInfo, "", "  ")
	if err != nil {
		return "", fmt.Errorf("formatting JSON: %w", err)
	}
	return string(userInfoJSON), nil
}

// Fetch the OAuth2 config including the client ID and secret
// as secrets.
func oauthConfig() (oauth2.Config, error) {
	clientId := secretstore.Get("client_id")
	if err := clientId.Err(); err != nil {
		return oauth2.Config{}, fmt.Errorf("getting client ID: %s", err.String())
	}
	clientSecret := secretstore.Get("client_secret")
	if err := clientSecret.Err(); err != nil {
		return oauth2.Config{}, fmt.Errorf("getting client secret: %s", err.String())
	}

	fmt.Fprintf(os.Stderr, "Client ID: %d\n", clientId.OK())
	fmt.Fprintf(os.Stderr, "Client Secret: %d\n", clientSecret.OK())

	clientIdReal := reveal.Reveal(*clientId.OK())
	clientSecretReal := reveal.Reveal(*clientSecret.OK())
	return oauth2.Config{
		ClientID:     *clientIdReal.String_(),
		ClientSecret: *clientSecretReal.String_(),
		RedirectURL:  "http://127.0.0.1:8000/oauth/callback",
		Scopes:       []string{},
		Endpoint:     github.Endpoint,
	}, nil
	// return oauth2.Config{}, nil
}
