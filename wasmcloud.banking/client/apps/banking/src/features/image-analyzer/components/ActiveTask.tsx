import {Task} from '@repo/common/services/backend/types';
import {getStatusFlagsFromTask} from '@repo/common/services/backend/utils/getStatusFlagsFromTask';
import {cn} from '@repo/ui/cn';
import {TaskCard} from './TaskCard';
import {TaskImage} from './TaskImage';
import {StatusListItem} from './StatusListItem';

type ActiveTaskProps = {
  task?: Task;
};

function ActiveTask({task}: ActiveTaskProps) {
  const {isResized, isUploaded, isAnalyzed, isComplete, isMatch} = getStatusFlagsFromTask(task);
  const title = isComplete
    ? isMatch
      ? 'Detection Confirmed'
      : 'Detection Negative'
    : isUploaded
    ? 'Analyzing'
    : 'Uploading';
  const time = new Date(task?.created_at?.toString() ?? '').toLocaleString();

  return (
    <TaskCard
      image={<TaskImage task={task} />}
      title={
        <span
          className={cn(
            isComplete ? (isMatch ? 'text-success' : 'text-danger') : 'text-foreground',
          )}
        >
          {title}
        </span>
      }
      subtitle={time}
      taskList={[
        <StatusListItem
          key="active-upload"
          text={isUploaded ? 'Uploaded' : 'Uploading'}
          status={isUploaded ? 'done' : 'processing'}
          doneStyle="default"
        />,
        <StatusListItem
          key="active-resize"
          text={isResized ? 'Resized' : 'Resizing'}
          status={isResized ? 'done' : 'processing'}
          doneStyle="default"
        />,
        <StatusListItem
          key="active-analyze"
          text={isAnalyzed ? (isMatch ? 'Matched' : 'No Match') : 'Analyzing'}
          status={isAnalyzed ? 'done' : 'processing'}
          doneStyle={isMatch ? 'positive' : 'negative'}
        />,
      ]}
    />
  );
}

export {ActiveTask};
