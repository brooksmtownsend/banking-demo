import * as React from 'react';
import {Task} from '@repo/common/services/backend/types';
import {useApi} from '@repo/common/services/backend/useApi';
import {toBytesString} from '@repo/common/services/backend/utils/toBytesString';
import {useRootStore} from '@/state/store';
import {MAX_FILE_SIZE} from '@/env';
import {ImageAnalyzerStatus} from '@/features/image-analyzer/state/slice';

type UseImageAnalyzerMethods = {
  handleFile(file?: File): Promise<void>;
  clearTasks(): void;
  reset(): void;
};

type UseImageAnalyzerData = {
  [Status in ImageAnalyzerStatus]: {
    status: Status;
    activeTask: Status extends 'error' | 'idle' | 'uploading' ? undefined : Task;
    error: Status extends 'error' ? string : null;
    tasks: Task[];
  };
}[ImageAnalyzerStatus];

type UseImageAnalyzerReturn = UseImageAnalyzerMethods & UseImageAnalyzerData;

export function useImageAnalyzer(): UseImageAnalyzerReturn {
  const {analyze, task} = useApi();
  const {processTask, startUpload, handleError, clearTasks, reset} = useRootStore((state) => state);

  const data = useRootStore((state): UseImageAnalyzerData => {
    const {status, error, activeTaskId, tasks: allTasks} = state.imageAnalyzer;

    const tasks = state.imageAnalyzer.tasks
      .filter((t) => t.jobId !== activeTaskId)
      .sort((a, b) => (new Date(b.created_at) >= new Date(a.created_at) ? 1 : -1));

    switch (status) {
      case 'error': {
        return {
          activeTask: undefined,
          status,
          error,
          tasks,
        };
      }
      case 'idle':
      case 'uploading':
        return {
          activeTask: undefined,
          status,
          error,
          tasks,
        };
      case 'done':
      case 'processing':
        return {
          activeTask: allTasks.find((t) => t.jobId === activeTaskId)!,
          status,
          error,
          tasks,
        };
    }
  });

  React.useEffect(() => {
    if (data.status === 'processing') {
      setTimeout(async () => {
        const taskResponse = await task(data.activeTask.jobId);
        processTask(taskResponse.data);
      }, 500);
    }
  }, [data.activeTask?.jobId, processTask, data.status, task]);

  const handleFile = React.useCallback(
    async (file?: File) => {
      if (!file) {
        handleError('No file selected');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        const max = toBytesString(MAX_FILE_SIZE);
        const actual = toBytesString(file.size);
        handleError(`File is too large (max ${max}, file ${actual})`);
        return;
      }
      startUpload();
      try {
        const response = await analyze(file);
        processTask(response.data);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown Error';
        handleError(message);
      }
    },
    [startUpload, analyze, processTask, handleError],
  );

  const methods = {
    clearTasks,
    handleFile,
    reset,
  } satisfies UseImageAnalyzerMethods;

  return {
    ...data,
    ...methods,
  };
}
