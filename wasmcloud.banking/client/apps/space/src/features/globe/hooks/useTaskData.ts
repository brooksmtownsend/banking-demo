import React from 'react';
import {Task} from '@repo/common/services/backend/types';
import {useApi} from '@repo/common/services/backend/useApi';
import {GlobePin} from '@/features/globe/state/slice';
import {useInterval} from '@/features/globe/hooks/useInterval';

function splitLatLng(location: string): {lat: number; long: number} {
  const [lat, long] = location.split(/,\s*?/).map(parseFloat);
  return {lat, long};
}

function taskToMapPin(task: Task): GlobePin {
  return {
    id: task.jobId,
    name: new Date(task.completed_at ?? '').toLocaleString(),
    type: 'pin',
    data: {
      location: splitLatLng(task.location),
    },
  };
}

function useTaskData() {
  const {tasks: fetchTasks} = useApi();
  const [taskObjects, setTaskObjects] = React.useState<GlobePin[]>([]);

  const update = React.useCallback(async () => {
    try {
      const response = await fetchTasks();

      const tasks = response.data;

      setTaskObjects(
        tasks
          .filter((task) => task.location !== '0, 0')
          .sort((a, b) => (new Date(a.created_at) > new Date(b.created_at) ? -1 : 1))
          .map(taskToMapPin),
      );
    } catch (error) {
      console.error(error);
    }
  }, [fetchTasks]);

  useInterval(update, 5_000);

  return taskObjects;
}

export {useTaskData};
