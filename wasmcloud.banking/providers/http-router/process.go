package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"

	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"

	"github.com/cosmonic-labs/wasmcloud.space/providers/http-router/bindings/demo/image_analyzer/analyzer"
	resizer "github.com/cosmonic-labs/wasmcloud.space/providers/http-router/bindings/demo/image_processor/resizer"
	tracker "github.com/cosmonic-labs/wasmcloud.space/providers/http-router/bindings/demo/task_manager/tracker"
)

const MaxUploadSize = 1e7 // 10 MB
type ProcessProxy struct {
	tracer trace.Tracer
	server *Server
}

func (t *ProcessProxy) createTask(ctx context.Context, originalAsset string) (string, error) {
	latLong := "0, 0"
	if geoIp, hasGeoIp := geoIP(ctx); hasGeoIp {
		latLong = fmt.Sprintf("%f, %f", geoIp.Lat, geoIp.Lon)
	}

	client := t.server.WRPCClient("demo", "task-manager")
	res, err := tracker.Start(ctx, client, latLong, originalAsset)
	if err != nil {
		return "", err
	}

	if res.Err != nil {
		return "", fmt.Errorf("error creating task: %s", res.Err.Message)
	}

	return *res.Ok, nil
}

func (t *ProcessProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx, span := t.tracer.Start(r.Context(), "ServeHTTP")
	defer span.End()

	if err := r.ParseMultipartForm(MaxUploadSize); err != nil {
		http.Error(w, "The uploaded file is too big. Please choose an file that's less than 10MB in size", http.StatusBadRequest)
		return
	}

	image, _, err := r.FormFile("image")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer image.Close()

	imageBytes, err := io.ReadAll(image)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	client := t.server.WRPCClient("demo", "image-processor")

	slog.Info("Uploading image to image_processor")
	res, err := resizer.Upload(ctx, client, imageBytes)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		slog.Error("error calling resizer.Upload", slog.Any("error", err))
		return
	}

	if res.Err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		slog.Error("resizer.Upload returned error", slog.String("error", *res.Err))
		return
	}

	slog.Info("Creating task with task_manager")
	originalAsset := *res.Ok
	taskId, err := t.createTask(ctx, originalAsset)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		slog.Error("error creating task", slog.Any("error", err))
		return
	}

	slog.Info("Returning task to client")
	resp := frameData(JobCreateResponse{Id: taskId}, false)
	json.NewEncoder(w).Encode(resp)

	span.SetStatus(codes.Ok, "Served Request")

	slog.Info("Starting background processes")
	go t.resizeTask(taskId, originalAsset)
	go t.analyzeTask(taskId, imageBytes)
}

func (t *ProcessProxy) resizeTask(taskId string, originalAsset string) {
	ctx := context.Background()

	taskClient := t.server.WRPCClient("demo", "task-manager")
	client := t.server.WRPCClient("demo", "image-processor")

	res, err := resizer.Resize(ctx, client, originalAsset, 100, 100)
	if err != nil {
		slog.Error("error calling resizer.Resize", slog.Any("error", err))
		errStr := err.Error()
		_, err := tracker.CompleteResize(ctx, taskClient, taskId, nil, &errStr)
		if err != nil {
			slog.Error("error calling tracker.CompleteResize after resizer.Resize error", slog.Any("error", err))
			return
		}
		return
	}

	_, err = tracker.CompleteResize(ctx, taskClient, taskId, res.Ok, nil)
	if err != nil {
		slog.Error("error calling tracker.CompleteResize", slog.Any("error", err))
		return
	}
}

func (t *ProcessProxy) analyzeTask(taskId string, imageBytes []byte) {
	ctx := context.Background()

	taskClient := t.server.WRPCClient("demo", "task-manager")
	client := t.server.WRPCClient("demo", "image-analyzer")

	res, err := analyzer.Detect(ctx, client, imageBytes)
	if err != nil {
		slog.Error("error calling analyzer.Detect", slog.Any("error", err))
		errStr := err.Error()
		itsAFalse := false
		_, err := tracker.CompleteAnalyze(ctx, taskClient, taskId, &itsAFalse, &errStr)
		if err != nil {
			slog.Error("error calling tracker.CompleteAnalyzer after analyze.Detect error", slog.Any("error", err))
			return
		}
		return
	}

	_, err = tracker.CompleteAnalyze(ctx, taskClient, taskId, res.Ok, nil)
	if err != nil {
		slog.Error("error calling tracker.CompleteAnalyze", slog.Any("error", err))
		return
	}
}
