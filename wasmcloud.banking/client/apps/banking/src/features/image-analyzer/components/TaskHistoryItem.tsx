import {LoaderCircleIcon, SearchXIcon, SearchCheckIcon, CircleCheckBigIcon} from 'lucide-react';
import {Heading} from '@repo/ui/Heading';
import {Task} from '@repo/common/services/backend/types';
import {getBaseUrl} from '@repo/common/services/backend/utils/getBaseUrl';
import {useConfig} from '@repo/common/services/config/useConfig';
import {cn} from '@repo/ui/cn';

function TaskHistoryItem({task}: {task: Task}) {
  const config = useConfig();
  const isResized = task?.resize?.done;
  const isAnalyzed = task?.analyze?.done;
  const isComplete = isResized && isAnalyzed;
  const isMatch = task?.analyze?.match;
  const title = isComplete ? (isMatch ? 'Detection Confirmed' : 'Detection Negative') : 'Analyzing';
  const time = new Date(task?.created_at?.toString() ?? '').toLocaleString();

  const UploadIcon = CircleCheckBigIcon;
  const ResizeIcon = isResized ? CircleCheckBigIcon : LoaderCircleIcon;
  const AnalyzeIcon = isAnalyzed ? (isMatch ? SearchCheckIcon : SearchXIcon) : LoaderCircleIcon;

  const path = getBaseUrl(config)(`/api/blob/${task?.resize.resized}`);

  return (
    <div className="flex pr-2.5 justify-start items-center gap-2.5 bg-foreground/5 rounded-xl">
      <div
        className={cn(
          'h-16 ms-2 aspect-square rounded-xl overflow-hidden',
          isAnalyzed && (isMatch ? 'bg-success' : 'bg-danger'),
        )}
      >
        <div className="relative w-full h-full mix-blend-multiply">
          <img src={path} className="object-cover w-full h-full grayscale" alt="" />
        </div>
      </div>
      <div className="grow flex self-stretch px-1.5 py-4 justify-between items-start">
        <div className="flex flex-col justify-start items-start gap-2.5">
          <Heading
            as="h4"
            className={cn('font-medium text-base', isMatch ? 'text-success' : 'text-danger')}
          >
            {title}
          </Heading>
          <div className="text-foreground/60 text-xs">{time}</div>
        </div>
        <div className="justify-start items-center gap-2.5 flex mt-1.5">
          <UploadIcon className={cn('w-4 h-4 relative text-accent')} />
          <ResizeIcon className={cn('w-4 h-4 relative', isResized && 'text-accent')} />
          <AnalyzeIcon
            className={cn(
              'w-4 h-4 relative',
              !isAnalyzed && 'animate-spin',
              isAnalyzed && (isMatch ? 'text-success' : 'text-danger'),
            )}
          />
        </div>
      </div>
    </div>
  );
}

export {TaskHistoryItem};
