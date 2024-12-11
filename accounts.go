package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	// Generated interfaces

	"github.com/brooksmtownsend/multitiersecurity/gen/wasi/keyvalue/store"
	"github.com/google/uuid"

	"go.bytecodealliance.org/cm"
)

type Account struct {
	// GUID for the account
	ID string `json:"id"`
	// Name of the account holder
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	// Current balance of the account
	Balance float64 `json:"balance"`
	// Currency  string  `json:"currency"`
	// CreatedAt string  `json:"created_at"`
}

// Handler to return a list of account IDs
func accountsHandler(w http.ResponseWriter, _ *http.Request) {
	kv, kvErr := KV()
	if kvErr != nil {
		http.Error(w, kvErr.String(), http.StatusInternalServerError)
		return
	}

	accountIDs, err := getAllAccountIDs(kv)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// TODO: valid JSON or whatever
	fmt.Fprintf(w, "%s", accountIDs)
}

// Handler to create a new account
func newAccountHandler(w http.ResponseWriter, _ *http.Request) {
	kv, kvErr := KV()
	if kvErr != nil {
		http.Error(w, kvErr.String(), http.StatusInternalServerError)
		return
	}

	// TODO: based on payload
	// Create a new account
	id := uuid.New().String()
	account := Account{
		ID:        id,
		FirstName: "John",
		LastName:  "Doe",
		Balance:   100.0,
	}

	serialized, err := json.Marshal(account)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	set := kv.Set(account.ID, cm.ToList(serialized))
	if err := set.Err(); err != nil {
		http.Error(w, err.String(), http.StatusInternalServerError)
		return
	}

	// Add the account ID to the list of accounts
	accountIDs, err := getAllAccountIDs(kv)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	accountIDs = append(accountIDs, id)
	accountsSet, err := json.Marshal(accountIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	set = kv.Set("accounts", cm.ToList(accountsSet))
	if err := set.Err(); err != nil {
		http.Error(w, err.String(), http.StatusInternalServerError)
		return
	}

	// TODO: JSON response
	fmt.Fprintf(w, "Successfully created account %v", account.ID)
}

// Helper function to easily fetch all account IDs
func getAllAccountIDs(kv *store.Bucket) ([]string, error) {
	serializedAccountIDs := kv.Get("accounts")
	if err := serializedAccountIDs.Err(); err != nil {
		return make([]string, 0), errors.New(err.String())
	}
	accountIDs := make([]string, 0)
	if serializedAccountIDs.OK().Some() != nil {
		err := json.Unmarshal(serializedAccountIDs.OK().Value().Slice(), &accountIDs)
		if err != nil {
			return make([]string, 0), err
		}
	}
	return accountIDs, nil
}
