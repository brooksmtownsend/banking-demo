import {PartialTask} from '@repo/common/services/backend/types';
import {ImageAnalyzerStatus} from '../state/slice';
import {StatusListItem} from './StatusListItem';

export function ResizeStatus({
  task,
  status: apiStatus,
}: {
  task: PartialTask | undefined;
  status: ImageAnalyzerStatus;
}): React.ReactElement {
  const status = (() => {
    if (apiStatus === 'idle') return 'idle';
    if (apiStatus === 'error' || task?.resize?.error === true) return 'error';
    if (apiStatus === 'uploading' || task?.resize?.done !== true) return 'processing';
    if (task?.resize?.done === true) return 'done';
    return 'idle';
  })();

  const text = {
    idle: 'Resize',
    error: 'Error',
    processing: 'Resizing',
    done: 'Resized',
  }[status];

  const className = apiStatus === 'idle' || apiStatus === 'error' ? 'opacity-50' : '';

  return (
    <StatusListItem
      key="active-upload"
      className={className}
      text={text}
      status={status}
      doneStyle="default"
    />
  );
}
