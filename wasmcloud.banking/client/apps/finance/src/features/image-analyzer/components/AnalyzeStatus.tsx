import {PartialTask} from '@repo/common/services/backend/types';
import {StatusListItem} from './StatusListItem';
import {ImageAnalyzerStatus} from '../state/slice';

export function AnalyzeStatus({
  task,
  status: apiStatus,
}: {
  task: PartialTask | undefined;
  status: ImageAnalyzerStatus;
}): React.ReactElement {
  const status = (() => {
    if (apiStatus === 'idle') return 'idle';
    if (apiStatus === 'error' || task?.analyze?.error === true) return 'error';
    if (apiStatus === 'uploading' || task?.analyze?.done !== true) return 'processing';
    if (task?.resize?.done === true) return 'done';
    return 'idle';
  })();

  const text = {
    idle: 'Analyze',
    error: 'Error',
    processing: 'Analyzing',
    done: 'Analyzed',
  }[status];

  const className = apiStatus === 'idle' || apiStatus === 'error' ? 'opacity-50' : '';
  const doneStyle = task?.analyze?.match === true ? 'positive' : 'negative';

  return (
    <StatusListItem
      key="active-upload"
      className={className}
      text={text}
      status={status}
      doneStyle={doneStyle}
    />
  );
}
