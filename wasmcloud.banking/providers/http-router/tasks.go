package main

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"go.opentelemetry.io/otel/trace"

	tracker "github.com/cosmonic-labs/wasmcloud.space/providers/http-router/bindings/demo/task_manager/tracker"
)

type Frame struct {
	Error bool        `json:"error,omitempty"`
	Data  interface{} `json:"data,omitempty"`
}

func frameData(data interface{}, error bool) Frame {
	return Frame{
		Error: error,
		Data:  data,
	}
}

type JobCreateResponse struct {
	Id string `json:"jobId"`
}

type JobResize struct {
	Done     bool   `json:"done"`
	Error    bool   `json:"error"`
	Original string `json:"original"`
	Resized  string `json:"resized"`
}

type JobAnalyze struct {
	Done  bool `json:"done"`
	Error bool `json:"error"`
	Match bool `json:"match"`
}

type Job struct {
	JobID       string     `json:"jobId"`
	Location    string     `json:"location"`
	Resize      JobResize  `json:"resize"`
	Analyze     JobAnalyze `json:"analyze"`
	CreatedAt   time.Time  `json:"created_at"`
	CompletedAt string     `json:"completed_at,omitempty"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type TasksProxy struct {
	tracer trace.Tracer
	server *Server
}

func (t *TasksProxy) getTask(w http.ResponseWriter, r *http.Request) {
	ctx, span := t.tracer.Start(r.Context(), "getTask")
	defer span.End()

	taskId := r.PathValue("id")
	slog.Info("Getting task", slog.String("taskId", taskId))

	client := t.server.WRPCClient("demo", "task-manager")
	resp, err := tracker.Get(ctx, client, taskId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		slog.Error("error calling tracker.Get", slog.Any("error", err))
		return
	}

	if resp.Err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		slog.Error("tracker.Get returned error", slog.Any("error", resp.Err))
		return
	}

	job := taskToJob(*resp.Ok)

	json.NewEncoder(w).Encode(frameData(job, false))
}

func (t *TasksProxy) listTasks(w http.ResponseWriter, r *http.Request) {
	ctx, span := t.tracer.Start(r.Context(), "listTasks")
	defer span.End()

	client := t.server.WRPCClient("demo", "task-manager")
	resp, err := tracker.List(ctx, client)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		slog.Error("error calling tracker.List", slog.Any("error", err))
		return
	}

	if resp.Err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		slog.Error("tracker.List returned error", slog.Any("error", resp.Err))
		return
	}

	taskList := []Job{}
	for _, task := range *resp.Ok {
		taskList = append(taskList, taskToJob(*task))
	}

	json.NewEncoder(w).Encode(frameData(taskList, false))
}

func (t *TasksProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// GET /api/tasks -> list
	// GET /api/tasks/:id -> read
	ctx, span := t.tracer.Start(r.Context(), "ServeHTTP")
	defer span.End()

	r = r.WithContext(ctx)

	if r.PathValue("id") != "" {
		t.getTask(w, r)
	} else {
		t.listTasks(w, r)
	}
}

func taskToJob(trackerTask tracker.Operation) Job {
	job := Job{
		JobID:     trackerTask.Id,
		Location:  trackerTask.ClientLocation,
		CreatedAt: time.Now(),
		Resize:    JobResize{Original: trackerTask.OriginalAsset},
	}

	if createdAt, err := time.Parse(time.RFC3339, trackerTask.CreatedAt); err == nil {
		job.CreatedAt = createdAt
	}

	if trackerTask.ResizeError != nil || trackerTask.ResizedAsset != nil {
		job.Resize.Done = true
		if trackerTask.ResizeError != nil {
			job.Resize.Error = true
		}

		if trackerTask.ResizedAsset != nil {
			job.Resize.Resized = *trackerTask.ResizedAsset
		}

		if resizeTime, err := time.Parse(time.RFC3339, *trackerTask.ResizedAt); err == nil {
			job.UpdatedAt = resizeTime
		}
	}

	if trackerTask.AnalyzeError != nil || trackerTask.AnalyzeResult != nil {
		job.Analyze.Done = true
		if trackerTask.AnalyzeError != nil {
			job.Analyze.Error = true
		}

		if trackerTask.AnalyzeResult != nil {
			job.Analyze.Match = *trackerTask.AnalyzeResult
		}

		if analyzeTime, err := time.Parse(time.RFC3339, *trackerTask.AnalyzedAt); err == nil {
			if job.UpdatedAt.IsZero() {
				job.UpdatedAt = analyzeTime
			} else {
				if analyzeTime.After(job.UpdatedAt) {
					job.CompletedAt = analyzeTime.Format(time.RFC3339)
				} else {
					job.CompletedAt = job.UpdatedAt.Format(time.RFC3339)
				}
			}
		}
	}

	return job
}
