package main

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"go.opentelemetry.io/otel/trace"

	tracker "github.com/cosmonic-labs/wasmcloud.space/providers/http-router/bindings/demo/task_manager/tracker"
)

type AuthProxy struct {
	tracer trace.Tracer
	server *Server
}

func (t *AuthProxy) login(w http.ResponseWriter, r *http.Request) {
	ctx, span := t.tracer.Start(r.Context(), "login")
	defer span.End()

	slog.Info("Logging in user")

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

func (t *AuthProxy) listTasks(w http.ResponseWriter, r *http.Request) {
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

func (t *AuthProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// GET /login -> login
	// GET /oauth/callback -> oauthCallback
	ctx, span := t.tracer.Start(r.Context(), "ServeHTTP")
	defer span.End()

	r = r.WithContext(ctx)

	if r.PathValue("id") != "" {
		t.getTask(w, r)
	} else {
		t.listTasks(w, r)
	}
}
