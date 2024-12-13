import {ApiSuccessResponse} from '#services/backend/types.ts';
import {apiFetch} from '#services/backend/utils/apiFetch.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {ConfigResponse} from '#services/config/context.tsx';

export type Task = {
  jobId: string;
  resize: ResizeJob;
  analyze: AnalyzeJob;
  location: string;
  created_at: string;
  completed_at: string | undefined;
  updated_at: string;
};

export type PartialTask = Omit<Partial<Task>, 'jobId'> & {jobId: string};

type ResizeJob = {
  done: boolean;
  error: boolean;
  original: string;
  resized: string;
};

type AnalyzeJob = {
  done: boolean;
  error: boolean;
  match: boolean;
};

type TasksResponse = ApiSuccessResponse<Task[]>;

function tasks(config: ConfigResponse): () => Promise<TasksResponse> {
  return () => apiFetch(getBaseUrl(config)(config.apiPaths.tasks));
}

type TaskResponse = ApiSuccessResponse<Task>;

function task(config: ConfigResponse): (id: string) => Promise<TaskResponse> {
  return (id) => apiFetch(getBaseUrl(config)(config.apiPaths.task, {id}));
}

export {task, tasks};
