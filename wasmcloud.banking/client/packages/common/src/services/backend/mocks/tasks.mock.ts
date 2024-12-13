import {API_V2_ENABLED, hasFeature, log, secondsBetween} from '#services/backend/mocks/utils.ts';
import {Task, PartialTask} from '#services/backend/types.ts';
import {expandTaskFromPartial} from '#services/backend/utils/expandTaskFromPartial.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';

const db = new Map<string, Task>();

function randomLatLongString() {
  const lat = Math.random() * 180 - 90;
  const long = Math.random() * 360 - 180;
  return `${lat},${long}`;
}

(() => {
  if (API_V2_ENABLED && !hasFeature('taskGen')) return;

  log('init');

  setInterval(() => {
    const id = Math.random().toString(36).slice(2);
    const task: PartialTask = {
      jobId: id,
      location: randomLatLongString(),
      analyze: {
        done: true,
        error: false,
        match: Math.random() > 0.5,
      },
      resize: {
        done: true,
        error: false,
        original: '/__mock__/original.png',
        resized: '/__mock__/resized.png',
      },
    };
    log('adding task:', task);
    db.set(id, expandTaskFromPartial(task));
  }, secondsBetween(1, 5));
})();

type TasksFunction = typeof import('../api/tasks').tasks;

const tasks: TasksFunction = (config) => () => {
  return new Promise((resolve) => {
    log('req:', getBaseUrl(config)(config.apiPaths.tasks));

    const response = {
      error: false as const,
      data: Array.from(db.values()),
    };
    log('res:', response);
    return resolve(response);
  });
};

type TaskFunction = typeof import('../api/tasks').task;

const task: TaskFunction = (config) => (id: string) => {
  return new Promise((resolve) => {
    log('req:', getBaseUrl(config)(config.apiPaths.task, {id}));

    const taskResponse = (task: PartialTask) => {
      const newTask = expandTaskFromPartial(task);
      newTask.updated_at = new Date().toISOString();
      db.set(id, newTask);
      const response = {
        error: false as const,
        data: newTask,
      };
      log('res:', response);
      resolve(response);
    };

    const task = db.get(id) ?? ({jobId: id} as PartialTask);

    if (!task.resize?.done) {
      task.resize = {
        done: true,
        error: false,
        original: '/__mock__/original.png',
        resized: '/__mock__/resized.png',
      };
      setTimeout(() => {
        taskResponse(task);
      }, secondsBetween(0.5, 1));
    }

    if (!task.analyze?.done) {
      task.analyze = {
        done: true,
        error: false,
        match: Math.random() > 0.5,
      };
      setTimeout(() => {
        taskResponse(task);
      }, secondsBetween(3, 5));
    }

    taskResponse(task);
  });
};

export {task, tasks};
