package main

//go:generate go run github.com/bytecodealliance/wasm-tools-go/cmd/wit-bindgen-go generate --world task-manager --out gen ./wit

import (
	"fmt"

	"github.com/cosmonic-labs/wasmcloud.space/components/task-manager/gen/demo/task-manager/tracker"

	"github.com/cosmonic-labs/wasmcloud.space/components/task-manager/gen/wasmcloud/postgres/query"
	"github.com/cosmonic-labs/wasmcloud.space/components/task-manager/gen/wasmcloud/postgres/types"

	"github.com/bytecodealliance/wasm-tools-go/cm"
	"go.wasmcloud.dev/component/log/wasilog"
)

func init() {
	tracker.Exports.Start = taskManagerStart
	tracker.Exports.CompleteAnalyze = taskManagerCompleteAnalyze
	tracker.Exports.CompleteResize = taskManagerCompleteResize
	tracker.Exports.Get = taskManagerGet
	tracker.Exports.List = taskManagerList
	tracker.Exports.Delete = taskManagerDelete
}

func main() {}

const insertTaskQuery = `
INSERT INTO tasks(original_asset,location) VALUES($1,$2) RETURNING task_id
`

const updateTaskSetAnalyzeError = `
UPDATE tasks set analyzed_at=NOW(), analyze_error=$1 WHERE task_id = $2
`

const updateTaskSetAnalyzeResult = `
UPDATE tasks set analyzed_at=NOW(), analyze_result=$1 WHERE task_id = $2
`

const updateTaskSetResizeError = `
UPDATE tasks set resized_at=NOW(), resize_error=$1 WHERE task_id = $2
`

const updateTaskSetResizeResult = `
UPDATE tasks set resized_at=NOW(), resized_asset=$1 WHERE task_id = $2
`

const getTask = `
SELECT 
	task_id,original_asset,created_at,
	resize_error,resized_asset,resized_at,
	analyze_error,analyze_result,analyzed_at,location
FROM tasks WHERE task_id=$1 LIMIT 1
`

const listTasks = `
SELECT 
	task_id,original_asset,created_at,
	resize_error,resized_asset,resized_at,
	analyze_error,analyze_result,analyzed_at,location
FROM tasks
`

const deleteTask = `
DELETE FROM tasks WHERE task_id=$1
`

func taskManagerStart(clientLocation string, originalAsset string) (result cm.Result[string, string, tracker.OperationError]) {
	logger := wasilog.ContextLogger("Start")

	insertTaskRes := Query(insertTaskQuery, types.PgValueText(originalAsset), types.PgValueText(clientLocation))
	if insertTaskRes.IsErr() {
		logger.Error("Got an error creating task", "error", insertTaskRes.Err())
		return cm.Err[cm.Result[string, string, tracker.OperationError]](tracker.OperationError{Message: "Error creating task"})
	}

	rows := insertTaskRes.OK().Slice()
	if len(rows) == 0 {
		logger.Error("Task doesn't exist")
		return cm.Err[cm.Result[string, string, tracker.OperationError]](tracker.OperationError{Message: "Task doesn't exist"})
	}

	row := rows[0].Slice()

	return cm.OK[cm.Result[string, string, tracker.OperationError]](*row[0].Value.Text())
}

func taskManagerCompleteAnalyze(id string, detected cm.Option[bool], analyzeError cm.Option[string]) (result cm.Result[tracker.OperationError, struct{}, tracker.OperationError]) {
	logger := wasilog.ContextLogger("CompleteAnalyze")

	if analyzeError.Some() != nil {
		updateTaskRes := Query(updateTaskSetAnalyzeError, types.PgValueText(*analyzeError.Some()), types.PgValueText(id))
		if updateTaskRes.IsErr() {
			logger.Error("Got an error from query")
			return cm.Err[cm.Result[tracker.OperationError, struct{}, tracker.OperationError]](tracker.OperationError{Message: "Error updating task"})
		}
		return cm.OK[cm.Result[tracker.OperationError, struct{}, tracker.OperationError]](struct{}{})
	}

	if detected.None() {
		logger.Error("Must provide either detection or error")
		return cm.Err[cm.Result[tracker.OperationError, struct{}, tracker.OperationError]](tracker.OperationError{Message: "Must provide either detection or error"})
	}

	updateTaskRes := Query(updateTaskSetAnalyzeResult, types.PgValueBool(detected.Value()), types.PgValueText(id))
	if updateTaskRes.IsErr() {
		logger.Error("Got an error from query")
		return cm.Err[cm.Result[tracker.OperationError, struct{}, tracker.OperationError]](tracker.OperationError{Message: "Error updating task"})
	}

	return cm.OK[cm.Result[tracker.OperationError, struct{}, tracker.OperationError]](struct{}{})
}

func taskManagerCompleteResize(id string, resizedAsset cm.Option[string], resizedError cm.Option[string]) (result cm.Result[tracker.OperationError, struct{}, tracker.OperationError]) {
	logger := wasilog.ContextLogger("CompleteResize")

	if resizedError.Some() != nil {
		updateTaskRes := Query(updateTaskSetResizeError, types.PgValueText(resizedError.Value()), types.PgValueText(id))
		if updateTaskRes.IsErr() {
			logger.Error("Got an error from query")
			return cm.Err[cm.Result[tracker.OperationError, struct{}, tracker.OperationError]](tracker.OperationError{Message: "Error updating task"})
		}
		return cm.OK[cm.Result[tracker.OperationError, struct{}, tracker.OperationError]](struct{}{})
	}

	if resizedAsset.None() {
		logger.Error("Must provide either resized asset or error")
		return cm.Err[cm.Result[tracker.OperationError, struct{}, tracker.OperationError]](tracker.OperationError{Message: "Must provide either resized asset or error"})
	}

	updateTaskRes := Query(updateTaskSetResizeResult, types.PgValueText(resizedAsset.Value()), types.PgValueText(id))
	if updateTaskRes.IsErr() {
		logger.Error("Got an error from query")
		return cm.Err[cm.Result[tracker.OperationError, struct{}, tracker.OperationError]](tracker.OperationError{Message: "Error updating task"})
	}

	return cm.OK[cm.Result[tracker.OperationError, struct{}, tracker.OperationError]](struct{}{})
}

// Get func(id string) (result cm.Result[OperationShape, Operation, OperationError])
func taskManagerGet(id string) (result cm.Result[tracker.OperationShape, tracker.Operation, tracker.OperationError]) {
	logger := wasilog.ContextLogger("Get")

	getTaskRes := Query(getTask, types.PgValueText(id))
	if getTaskRes.IsErr() {
		logger.Error("Got an error from query")
		return cm.Err[cm.Result[tracker.OperationShape, tracker.Operation, tracker.OperationError]](tracker.OperationError{Message: "Error getting task"})
	}

	rows := getTaskRes.OK().Slice()
	if len(rows) == 0 {
		logger.Error("Task not found")
		return cm.Err[cm.Result[tracker.OperationShape, tracker.Operation, tracker.OperationError]](tracker.OperationError{Message: "Task not found"})
	}

	return cm.OK[cm.Result[tracker.OperationShape, tracker.Operation, tracker.OperationError]](convertRowToOperation(rows[0]))
}

func taskManagerList() (result cm.Result[cm.List[tracker.Operation], cm.List[tracker.Operation], tracker.OperationError]) {
	logger := wasilog.ContextLogger("List")

	listQueryRes := Query(listTasks)
	if listQueryRes.IsErr() {
		logger.Error("Got an error from query")
		return cm.Err[cm.Result[cm.List[tracker.Operation], cm.List[tracker.Operation], tracker.OperationError]](tracker.OperationError{Message: "Error listing tasks"})
	}

	rows := listQueryRes.OK().Slice()
	tasks := []tracker.Operation{}
	for _, row := range rows {
		tasks = append(tasks, convertRowToOperation(row))
	}

	return cm.OK[cm.Result[cm.List[tracker.Operation], cm.List[tracker.Operation], tracker.OperationError]](cm.ToList(tasks))
}

func taskManagerDelete(id string) (result cm.Result[tracker.OperationError, struct{}, tracker.OperationError]) {
	logger := wasilog.ContextLogger("Delete")

	deleteTaskRes := Query(deleteTask, types.PgValueText(id))
	if deleteTaskRes.IsErr() {
		logger.Error("Got an error deleting task")
		return cm.Err[cm.Result[tracker.OperationError, struct{}, tracker.OperationError]](tracker.OperationError{Message: "Error deleting task"})
	}

	return cm.OK[cm.Result[tracker.OperationError, struct{}, tracker.OperationError]](struct{}{})
}

func Query(stmt string, params ...types.PgValue) cm.Result[query.QueryErrorShape, cm.List[types.ResultRow], types.QueryError] {
	return query.Query(stmt, cm.ToList(params))
}

func formatTimestamp(t types.PgValue) string {
	if t.Timestamp_() != nil {
		ts := t.Timestamp_()
		date := ts.Date.Ymd()
		return fmt.Sprintf("%02d-%02d-%02dT%02d:%02d:%02dZ", date.F0, date.F1, date.F2, ts.Time.Hour, ts.Time.Min, ts.Time.Sec)
	}
	return ""
}

func convertRowToOperation(row types.ResultRow) tracker.Operation {
	fields := row.Slice()

	resizedAsset := cm.None[string]()
	resizeError := cm.None[string]()
	resizedAt := cm.None[string]()

	analyzeResult := cm.None[bool]()
	analyzeError := cm.None[string]()
	analyzedAt := cm.None[string]()

	if !fields[3].Value.Null() {
		resizeError = cm.Some(*fields[3].Value.Text())
	}
	if !fields[4].Value.Null() {
		resizedAsset = cm.Some(*fields[4].Value.Text())
	}
	if !fields[5].Value.Null() {
		resizedAt = cm.Some(formatTimestamp(fields[5].Value))
	}

	if !fields[6].Value.Null() {
		analyzeError = cm.Some(*fields[6].Value.Text())
	}
	if !fields[7].Value.Null() {
		analyzeResult = cm.Some(*fields[7].Value.Bool())
	}
	if !fields[8].Value.Null() {
		analyzedAt = cm.Some(formatTimestamp(fields[8].Value))
	}

	return tracker.Operation{
		ID:             *fields[0].Value.Text(),
		OriginalAsset:  *fields[1].Value.Text(),
		CreatedAt:      formatTimestamp(fields[2].Value),
		ClientLocation: *fields[9].Value.Text(),

		ResizedAsset: resizedAsset,
		ResizeError:  resizeError,
		ResizedAt:    resizedAt,

		AnalyzeResult: analyzeResult,
		AnalyzeError:  analyzeError,
		AnalyzedAt:    analyzedAt,
	}
}
