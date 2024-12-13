import React from 'react';
import {PlusIcon, RefreshCcw} from 'lucide-react';
import {cn} from '@repo/ui/cn';
import {Card} from '@repo/ui/Card';
import {ButtonBlob} from '@repo/ui/ButtonBlob';
import useDragging from '@repo/ui/drag-and-drop/useDragging';
import {ActiveTask} from './ActiveTask';
import {Upload} from './Upload';
import {NewTask} from './NewTask';
import {TaskHistoryItem} from './TaskHistoryItem';
import {ErrorTask} from './ErrorTask';
import {useImageAnalyzer} from '../hooks/useImageAnalyzer';

const ImageAnalyzer = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  ({className, ...props}, ref) => {
    const {handleFile, clearTasks, reset, tasks, activeTask, error, status} = useImageAnalyzer();

    const onDrop = React.useCallback((file?: File) => handleFile(file), [handleFile]);
    const onChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0]),
      [handleFile],
    );

    const {DragPortal} = useDragging({onDrop});

    return (
      <Card ref={ref} className={cn('relative', className)} {...props}>
        <div className="">
          {status === 'error' ? (
            <ErrorTask message={error}>
              <Upload onChange={onChange} />
            </ErrorTask>
          ) : status === 'idle' ? (
            <NewTask title="Image Analyzer" subtitle="Upload an image to get started">
              <Upload onChange={onChange} />
            </NewTask>
          ) : (
            <ActiveTask task={activeTask} />
          )}
        </div>
        <div className="flex flex-col gap-2 mt-2 empty:mt-0">
          {tasks.map((task) => (
            <TaskHistoryItem key={task.jobId} task={task} />
          ))}
          {tasks.length > 0 && (
            <button className="text-xs text-foreground/40 underline -mb-1.5" onClick={clearTasks}>
              Clear My Tasks List
            </button>
          )}
        </div>
        <div className="top-0 right-0 absolute">
          <ButtonBlob
            onClick={reset}
            className="text-surface"
            isDisabled={status === 'idle'}
            isLoading={status === 'uploading' || status === 'processing'}
          >
            {status === 'error' ? <RefreshCcw size={24} /> : <PlusIcon size={24} />}
          </ButtonBlob>
        </div>

        <DragPortal>
          <div className="m-2 border-4 rounded border-dashed border-primary-foreground/20 h-full">
            <div className="p-4 text-center flex flex-col items-center justify-center h-full text-sm">
              <p>
                <span className="text-accent underline">Drop the file here</span>
              </p>
            </div>
          </div>
        </DragPortal>
      </Card>
    );
  },
);

export {ImageAnalyzer};
