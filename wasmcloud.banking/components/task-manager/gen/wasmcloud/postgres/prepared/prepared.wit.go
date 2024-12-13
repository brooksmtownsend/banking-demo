// Code generated by wit-bindgen-go. DO NOT EDIT.

// Package prepared represents the imported interface "wasmcloud:postgres/prepared@0.1.1-draft".
//
// Interface for querying a Postgres database with prepared statements
package prepared

import (
	"github.com/bytecodealliance/wasm-tools-go/cm"
	"github.com/cosmonic-labs/wasmcloud.space/components/task-manager/gen/wasmcloud/postgres/types"
)

// PgValue represents the type alias "wasmcloud:postgres/prepared@0.1.1-draft#pg-value".
//
// See [types.PgValue] for more information.
type PgValue = types.PgValue

// ResultRow represents the type alias "wasmcloud:postgres/prepared@0.1.1-draft#result-row".
//
// See [types.ResultRow] for more information.
type ResultRow = types.ResultRow

// StatementPrepareError represents the type alias "wasmcloud:postgres/prepared@0.1.1-draft#statement-prepare-error".
//
// See [types.StatementPrepareError] for more information.
type StatementPrepareError = types.StatementPrepareError

// PreparedStatementExecError represents the type alias "wasmcloud:postgres/prepared@0.1.1-draft#prepared-statement-exec-error".
//
// See [types.PreparedStatementExecError] for more information.
type PreparedStatementExecError = types.PreparedStatementExecError

// PreparedStatementToken represents the string "wasmcloud:postgres/prepared@0.1.1-draft#prepared-statement-token".
//
// A token that represents a previously created prepared statement,
//
// This token can be expected to be somewhat opaque to users.
//
//	type prepared-statement-token = string
type PreparedStatementToken string

// Prepare represents the imported function "prepare".
//
// Prepare a statement, given a connection token (which can represent a connection
// *or* session),
// to a Postgres database.
//
// Queries *must* be parameterized, with named arguments in the form of `$<integer>`,
// for example:
//
//	SELECT email,username FROM users WHERE uuid=$1;
//
// NOTE: To see how to obtain a `connection-token`, see `connection.wit`.
//
//	prepare: func(statement: string) -> result<prepared-statement-token, statement-prepare-error>
//
//go:nosplit
func Prepare(statement string) (result cm.Result[StatementPrepareErrorShape, PreparedStatementToken, StatementPrepareError]) {
	statement0, statement1 := cm.LowerString(statement)
	wasmimport_Prepare((*uint8)(statement0), (uint32)(statement1), &result)
	return
}

// Exec represents the imported function "exec".
//
// Execute a prepared statement, returning the number of rows affected
//
//	exec: func(stmt-token: prepared-statement-token, params: list<pg-value>) -> result<u64,
//	prepared-statement-exec-error>
//
//go:nosplit
func Exec(stmtToken PreparedStatementToken, params cm.List[PgValue]) (result cm.Result[PreparedStatementExecErrorShape, uint64, PreparedStatementExecError]) {
	stmtToken0, stmtToken1 := cm.LowerString(stmtToken)
	params0, params1 := cm.LowerList(params)
	wasmimport_Exec((*uint8)(stmtToken0), (uint32)(stmtToken1), (*PgValue)(params0), (uint32)(params1), &result)
	return
}
