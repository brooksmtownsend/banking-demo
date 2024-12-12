package main

import (
	"encoding/json"
	"errors"
	"net/http"

	// Generated interfaces

	"github.com/brooksmtownsend/multitiersecurity/gen/wasi/keyvalue/store"
	"github.com/julienschmidt/httprouter"

	"go.bytecodealliance.org/cm"
)

type Account struct {
	ID           string        `json:"id"`
	Transactions []Transaction `json:"transactions"`
}

type Transaction struct {
	ID          int     `json:"id"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	Status      string  `json:"status"`
	Method      string  `json:"method"`
	Date        int64   `json:"date"`
}

const ProcessingTransaction = "Processing"
const CompleteTransaction = "Complete"
const InProgressTransaction = "In Progress"
const CancelledTransaction = "Cancelled"
const CreditMethod = "Credit"
const CheckMethod = "Check"
const TransferMethod = "Transfer"

// Handler to create a new account
func newAccountHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	kv, kvErr := KV()
	if kvErr != nil {
		http.Error(w, kvErr.String(), http.StatusInternalServerError)
		return
	}

	id := ps.ByName("id")
	if id == "" {
		http.Error(w, "No account ID provided", http.StatusBadRequest)
		return
	}

	account := Account{
		ID:           id,
		Transactions: make([]Transaction, 0),
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

	successResponse(w, account)
}

// Handler to return information about an account
func accountInfoHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	kv, kvErr := KV()
	if kvErr != nil {
		http.Error(w, kvErr.String(), http.StatusInternalServerError)
		return
	}
	id := ps.ByName("id")
	if id == "" {
		http.Error(w, "No account ID provided", http.StatusBadRequest)
		return
	}

	serializedAccount := kv.Get(id)
	if err := serializedAccount.Err(); err != nil {
		http.Error(w, err.String(), http.StatusInternalServerError)
		return
	}

	var account Account

	if serializedAccount.OK().Some() != nil {
		err := json.Unmarshal(serializedAccount.OK().Value().Slice(), &account)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	successResponse(w, account)
}

// Get all transactions for a user
func getTransactionsHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	kv, kvErr := KV()
	if kvErr != nil {
		http.Error(w, kvErr.String(), http.StatusInternalServerError)
		return
	}
	id := ps.ByName("id")
	if id == "" {
		http.Error(w, "No account ID provided", http.StatusBadRequest)
		return
	}

	serializedAccount := kv.Get(id)
	if err := serializedAccount.Err(); err != nil {
		http.Error(w, err.String(), http.StatusInternalServerError)
		return
	}

	var account Account

	if serializedAccount.OK().Some() != nil {
		err := json.Unmarshal(serializedAccount.OK().Value().Slice(), &account)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	successResponse(w, account.Transactions)
}

// Post a new transaction for a user
func postTransactionHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	kv, kvErr := KV()
	if kvErr != nil {
		http.Error(w, kvErr.String(), http.StatusInternalServerError)
		return
	}
	id := ps.ByName("id")
	if id == "" {
		http.Error(w, "No account ID provided", http.StatusBadRequest)
		return
	}
	var newTransaction Transaction
	err := json.NewDecoder(r.Body).Decode(&newTransaction)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	serializedAccount := kv.Get(id)
	if err := serializedAccount.Err(); err != nil {
		http.Error(w, err.String(), http.StatusInternalServerError)
		return
	}

	var account Account

	if serializedAccount.OK().Some() != nil {
		err := json.Unmarshal(serializedAccount.OK().Value().Slice(), &account)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
	if newTransaction.ID == 0 {
		newTransaction.ID = len(account.Transactions) + 1
	}
	account.Transactions = append(account.Transactions, newTransaction)

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

	successResponse(w, newTransaction)
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

var transactions = []Transaction{
	{
		ID:          1,
		Description: "Victoria's Treats",
		Amount:      -52.14,
		Status:      ProcessingTransaction,
		Method:      CreditMethod,
		Date:        1727323200,
	},
	{
		ID:          2,
		Description: "Morgan Seis, LLC",
		Amount:      -428.47,
		Status:      CompleteTransaction,
		Method:      CreditMethod,
		Date:        1727150400,
	},
	{
		ID:          7,
		Description: "Wallmart",
		Amount:      -143.19,
		Status:      CompleteTransaction,
		Method:      CheckMethod,
		Date:        1727000600,
	},
	{
		ID:          3,
		Description: "Wallmart",
		Amount:      -112.23,
		Status:      InProgressTransaction,
		Method:      CheckMethod,
		Date:        1726804800,
	},
	{
		ID:          4,
		Description: "John Rowland",
		Amount:      -950.0,
		Status:      CancelledTransaction,
		Method:      TransferMethod,
		Date:        1726734968,
	},
	{
		ID:          5,
		Description: "Harry's, LLC",
		Amount:      -24.49,
		Status:      CompleteTransaction,
		Method:      CreditMethod,
		Date:        1726734968,
	},
	{
		ID:          6,
		Description: "Game's Store",
		Amount:      -89.49,
		Status:      CompleteTransaction,
		Method:      CreditMethod,
		Date:        1726632000,
	},
	{
		ID:          9,
		Description: "Monthly Pay",
		Amount:      4331.57,
		Status:      CompleteTransaction,
		Method:      CreditMethod,
		Date:        1726286400,
	},
	{
		ID:          8,
		Description: "Park Groceries",
		Amount:      -31.22,
		Status:      CompleteTransaction,
		Method:      CreditMethod,
		Date:        1726286400,
	},
}
