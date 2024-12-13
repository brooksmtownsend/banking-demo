import {PartialTask} from '@repo/common/services/backend/types';
import {StatusListItem} from './StatusListItem';
import {ImageAnalyzerStatus} from '../state/slice';

export function UploadStatus({
  task,
  status: apiStatus,
}: {
  task: PartialTask | undefined;
  status: ImageAnalyzerStatus;
}): React.ReactElement {
  const status = (() => {
    if (apiStatus === 'idle') return 'idle';
    if (apiStatus === 'error') return 'error';
    if (apiStatus === 'uploading') return 'processing';
    if (typeof task !== 'undefined') return 'done';
    return 'idle';
  })();

  const text = {
    idle: 'Upload',
    error: 'Error',
    processing: 'Uploading',
    done: 'Uploaded',
  }[status];

  return <StatusListItem key="active-upload" text={text} status={status} doneStyle="default" />;
}
