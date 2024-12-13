import {Task} from '@repo/common/services/backend/types';
import {expandTaskFromPartial} from '@repo/common/services/backend/utils/expandTaskFromPartial';
import {ImmerStateCreator} from '@/state/types';

type PartialTask = Omit<Partial<Task>, 'jobId'> & {jobId: string};

export type ImageAnalyzerStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

type ImageAnalyzerState = {
  [Status in ImageAnalyzerStatus]: {
    status: Status;
    activeTaskId: Status extends 'idle' | 'uploading' | 'error' ? null : string;
    error: Status extends 'error' ? string : null;
    tasks: Task[];
  };
}[ImageAnalyzerStatus];

type ImageAnalyzerActions = {
  startUpload(): void;
  processTask(task: PartialTask): void;
  handleError(message: string): void;
  reset(): void;
  clearTasks(): void;
};

type ImageAnalyzerSlice = {
  imageAnalyzer: ImageAnalyzerState;
} & ImageAnalyzerActions;

const createImageAnalyzerSlice: ImmerStateCreator<ImageAnalyzerSlice> = (set) => ({
  imageAnalyzer: {
    status: 'idle',
    activeTaskId: null,
    error: null,
    tasks: [],
  },
  startUpload: () =>
    set((state) => {
      state.imageAnalyzer.activeTaskId = null;
      state.imageAnalyzer.status = 'uploading';
      state.imageAnalyzer.error = null;
    }),
  processTask: (partialTask) =>
    set((state) => {
      const task = expandTaskFromPartial(partialTask);
      state.imageAnalyzer.activeTaskId = task.jobId;
      const isResized = task.resize?.done;
      const isAnalyzed = task.analyze?.done;
      const isComplete = isResized && isAnalyzed;
      state.imageAnalyzer.status = isComplete ? 'done' : 'processing';
      const existingIndex = state.imageAnalyzer.tasks.findIndex((t) => t.jobId === task.jobId);
      if (existingIndex === -1) {
        state.imageAnalyzer.tasks.push(task);
      } else {
        state.imageAnalyzer.tasks[existingIndex] = task;
      }
      state.imageAnalyzer.error = null;
    }),
  handleError: (message) =>
    set((state) => {
      state.imageAnalyzer.status = 'error';
      state.imageAnalyzer.activeTaskId = null;
      state.imageAnalyzer.error = message;
    }),
  reset: () =>
    set((state) => {
      state.imageAnalyzer.status = 'idle';
      state.imageAnalyzer.activeTaskId = null;
      state.imageAnalyzer.error = null;
    }),
  clearTasks: () =>
    set((state) => {
      state.imageAnalyzer.tasks = [];
      state.imageAnalyzer.status = 'idle';
      state.imageAnalyzer.activeTaskId = null;
    }),
});

export {createImageAnalyzerSlice, type ImageAnalyzerSlice};
