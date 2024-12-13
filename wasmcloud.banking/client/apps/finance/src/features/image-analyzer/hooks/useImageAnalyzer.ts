import * as React from 'react';
import {Task} from '@repo/common/services/backend/types';
import {useApi} from '@repo/common/services/backend/useApi';
import {toBytesString} from '@repo/common/services/backend/utils/toBytesString';
import {MAX_FILE_SIZE} from '@/env';
import {useRootStore} from '@/state/store';
import {ImageAnalyzerStatus} from '../state/slice';
import {useShallow} from 'zustand/react/shallow';

type UseImageAnalyzerMethods = {
  activeTask: Task | undefined;
  tasks: Task[];
  clearTasks(): void;
  reset(): void;
};

export function useImageAnalyzerTasks(): UseImageAnalyzerMethods {
  const clearTasks = useRootStore(useShallow((state) => state.clearTasks));
  const reset = useRootStore(useShallow((state) => state.reset));
  const activeTask = useRootStore(useShallow((state) => state.imageAnalyzer.activeTask));
  const tasks = useRootStore(
    useShallow((state) =>
      state.imageAnalyzer.tasks
        .filter((t) => t.jobId !== state.imageAnalyzer.activeTaskId)
        .sort((a, b) => (new Date(b.created_at) >= new Date(a.created_at) ? 1 : -1)),
    ),
  );

  return {
    activeTask,
    tasks,
    clearTasks,
    reset,
  };
}

type UseImageAnalyzerStatus = {
  [Status in ImageAnalyzerStatus]: [Status, Status extends 'error' ? string : undefined];
}[ImageAnalyzerStatus];

export function useImageAnalyzerStatus(): UseImageAnalyzerStatus {
  return useRootStore(
    useShallow((state) => {
      if (state.imageAnalyzer.status === 'error') {
        return ['error', state.imageAnalyzer.error] as const;
      }
      return [state.imageAnalyzer.status, undefined] as const;
    }),
  );
}

export function useImageAnalyzerUpload() {
  const {analyze, task} = useApi();
  const processTask = useRootStore((state) => state.processTask);
  const startUpload = useRootStore((state) => state.startUpload);
  const handleError = useRootStore((state) => state.handleError);

  const data = useRootStore(useShallow((state) => state.imageAnalyzer));

  const timeout = React.useRef<ReturnType<typeof setTimeout>>();
  React.useEffect(() => {
    const reset = () => {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    };

    const checkStatus = (id: string) => {
      if (timeout.current) return;
      timeout.current = setTimeout(async () => {
        const taskResponse = await task(id);
        processTask(taskResponse.data);
        reset();
      }, 500);
    };

    if (data.status === 'processing') {
      checkStatus(data.activeTask.jobId);
    } else {
      reset();
    }

    return reset;
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

  return handleFile;
}
