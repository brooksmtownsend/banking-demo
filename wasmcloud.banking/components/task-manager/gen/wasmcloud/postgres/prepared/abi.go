// Code generated by wit-bindgen-go. DO NOT EDIT.

package prepared

import (
	"github.com/bytecodealliance/wasm-tools-go/cm"
	"github.com/cosmonic-labs/wasmcloud.space/components/task-manager/gen/wasmcloud/postgres/types"
	"unsafe"
)

// StatementPrepareErrorShape is used for storage in variant or result types.
type StatementPrepareErrorShape struct {
	_     cm.HostLayout
	shape [unsafe.Sizeof(types.StatementPrepareError{})]byte
}

// PreparedStatementExecErrorShape is used for storage in variant or result types.
type PreparedStatementExecErrorShape struct {
	_     cm.HostLayout
	shape [unsafe.Sizeof(types.PreparedStatementExecError{})]byte
}