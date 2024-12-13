import {Task} from '@repo/common/services/backend/types';
import {expandTaskFromPartial} from '@repo/common/services/backend/utils/expandTaskFromPartial';
import {ImmerStateCreator} from '@/state/types';

type PartialTask = Omit<Partial<Task>, 'jobId'> & {jobId: string};

export type ImageAnalyzerStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

type ImageAnalyzerState = {
  [Status in ImageAnalyzerStatus]: {
    status: Status;
    activeTaskId: Status extends 'idle' | 'uploading' | 'error' ? undefined : string;
    activeTask: Status extends 'idle' | 'uploading' | 'error' ? undefined : Task;
    error: Status extends 'error' ? string : undefined;
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
    activeTaskId: undefined,
    activeTask: undefined,
    error: undefined,
    tasks: [],
  },
  startUpload: () =>
    set((state) => {
      state.imageAnalyzer.activeTaskId = undefined;
      state.imageAnalyzer.status = 'uploading';
      state.imageAnalyzer.error = undefined;
    }),
  processTask: (partialTask) =>
    set((state) => {
      // Expand the partial task to a full task and assign as the active task
      const task = expandTaskFromPartial(partialTask);
      state.imageAnalyzer.activeTaskId = task.jobId;
      state.imageAnalyzer.activeTask = task;

      // Update the task in the list of tasks
      const isComplete = task.resize?.done && task.analyze?.done;
      state.imageAnalyzer.status = isComplete ? 'done' : 'processing';

      // Add the task to the list of tasks if it doesn't already exist
      const existingIndex = state.imageAnalyzer.tasks.findIndex((t) => t.jobId === task.jobId);
      if (existingIndex === -1) {
        state.imageAnalyzer.tasks.push(task);
      } else {
        state.imageAnalyzer.tasks[existingIndex] = task;
      }

      // Clear the error
      state.imageAnalyzer.error = undefined;
    }),
  handleError: (message) =>
    set((state) => {
      state.imageAnalyzer.status = 'error';
      state.imageAnalyzer.activeTaskId = undefined;
      state.imageAnalyzer.error = message;
    }),
  reset: () =>
    set((state) => {
      state.imageAnalyzer.status = 'idle';
      state.imageAnalyzer.activeTaskId = undefined;
      state.imageAnalyzer.error = undefined;
    }),
  clearTasks: () =>
    set((state) => {
      state.imageAnalyzer.tasks = [];
      state.imageAnalyzer.status = 'idle';
      state.imageAnalyzer.activeTaskId = undefined;
    }),
});

export {createImageAnalyzerSlice, type ImageAnalyzerSlice};
