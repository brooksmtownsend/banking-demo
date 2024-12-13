import * as React from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@repo/ui/Dialog';
import {getStatusFlagsFromTask} from '@repo/common/services/backend/utils/getStatusFlagsFromTask';
import {Upload} from '@/features/image-analyzer/components/Upload';
import {TaskImage} from '@/features/image-analyzer/components/TaskImage';
import {AnalyzeStatus} from '@/features/image-analyzer/components/AnalyzeStatus';
import {ResizeStatus} from '@/features/image-analyzer/components/ResizeStatus';
import {UploadStatus} from '@/features/image-analyzer/components/UploadStatus';
import {useDashboardStore} from '../state/store';
import {
  useImageAnalyzerStatus,
  useImageAnalyzerTasks,
  useImageAnalyzerUpload,
} from '@/features/image-analyzer/hooks/useImageAnalyzer';

function DialogAccountValidation(): React.ReactElement {
  const {dialog, hideDialog, showDialog} = useDashboardStore();
  const onOpenChange = (open: boolean) => (open ? showDialog() : hideDialog());
  const {activeTask, reset} = useImageAnalyzerTasks();
  const [status, error] = useImageAnalyzerStatus();
  const handleFile = useImageAnalyzerUpload();

  const isError = status === 'error';
  const isIdle = status === 'idle';
  const {isUploaded, isComplete, isMatch} = getStatusFlagsFromTask(activeTask);

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0]),
    [handleFile],
  );

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Identity Verification</DialogTitle>
            <DialogDescription>
              In the interest of security, we need to verify your identity. Please upload a valid ID
              so that we can provide you with the best experience.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 mt-6">
            <div className="flex flex-row gap-4 xs:col-span-2">
              {isIdle ? (
                <Upload onChange={onChange} className="grow" />
              ) : (
                <>
                  <div className="aspect-square h-full min-h-20 overflow-hidden rounded-md border border-border shrink-0">
                    <TaskImage task={activeTask} />
                  </div>
                  <div className="flex flex-col gap-1.5 grow">
                    {isComplete ? (
                      isMatch ? (
                        <>
                          <div className="text-success font-medium">Verification Complete.</div>
                          <div className="text-xs flex flex-col gap-1 items-start text-foreground/80">
                            <span>
                              Thank you for verifying your account! You may close this window.
                            </span>
                            <button className="underline cursor-pointer" onClick={reset}>
                              Retry
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-danger font-medium">Verification Failed.</div>
                          <div className="text-xs flex flex-col gap-1 items-start text-foreground/80">
                            <span>We were unable to verify your identity. Please try again.</span>
                            <button className="underline cursor-pointer" onClick={reset}>
                              Retry
                            </button>
                          </div>
                        </>
                      )
                    ) : (
                      <div className="text-foreground font-medium">
                        {isUploaded ? 'Analyzing' : 'Uploading'}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <UploadStatus task={activeTask} status={status} />
              <ResizeStatus task={activeTask} status={status} />
              <AnalyzeStatus task={activeTask} status={status} />
            </div>
            {isError && <div className="xs:col-span-3 text-danger text-sm">{error}</div>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export {DialogAccountValidation};
