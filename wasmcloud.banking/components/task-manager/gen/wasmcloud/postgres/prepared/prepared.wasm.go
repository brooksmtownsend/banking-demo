// Code generated by wit-bindgen-go. DO NOT EDIT.

package prepared

import (
	"github.com/bytecodealliance/wasm-tools-go/cm"
)

// This file contains wasmimport and wasmexport declarations for "wasmcloud:postgres@0.1.1-draft".

//go:wasmimport wasmcloud:postgres/prepared@0.1.1-draft prepare
//go:noescape
func wasmimport_Prepare(statement0 *uint8, statement1 uint32, result *cm.Result[StatementPrepareErrorShape, PreparedStatementToken, StatementPrepareError])

//go:wasmimport wasmcloud:postgres/prepared@0.1.1-draft exec
//go:noescape
func wasmimport_Exec(stmtToken0 *uint8, stmtToken1 uint32, params0 *PgValue, params1 uint32, result *cm.Result[PreparedStatementExecErrorShape, uint64, PreparedStatementExecError])