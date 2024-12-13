import * as React from 'react';
import {RotateCcwIcon, VerifiedIcon} from 'lucide-react';
import {getStatusFlagsFromTask} from '@repo/common/services/backend/utils/getStatusFlagsFromTask';
import {useUser} from '@repo/common/services/user/useUser';
import {Button} from '@repo/ui/Button';
import {
  useImageAnalyzerStatus,
  useImageAnalyzerTasks,
} from '@/features/image-analyzer/hooks/useImageAnalyzer';
import {useNotifications} from '@/features/notifications/hooks/useNotifications';
import {DashboardCard} from './DashboardCard';
import {useDashboardStore} from '../state/store';

export function AccountStatusCard() {
  const {showDialog} = useDashboardStore();
  const {notify, clearAll} = useNotifications();
  const {activeTask, reset} = useImageAnalyzerTasks();
  const [status] = useImageAnalyzerStatus();
  const resetAndShowDialog = () => {
    reset();
    showDialog();
  };

  const user = useUser();
  const {isMatch} = getStatusFlagsFromTask(activeTask);
  const isFailure = status === 'error' || (status === 'done' && isMatch === false);
  const isSuccess = status === 'done' && isMatch === true;
  const stage = isFailure ? 'failed' : isSuccess ? 'success' : 'idle';

  React.useEffect(() => {
    clearAll();
    switch (stage) {
      case 'success':
        notify('Your identity has been verified successfully!', 'low');
        break;
      case 'failed':
        notify('Verification Failed', 'low');
        break;
      case 'idle':
        break;
    }
  }, [stage, notify, clearAll]);

  const {text, title} = (
    {
      idle: {
        title: <>Welcome back, {user.name.first}! 👋</>,
        text: (
          <>
            It looks like you haven't verified your identity yet. Please validate it to continue
            enjoying the full features of our platform.
          </>
        ),
      },
      success: {
        title: <>You're verified, {user.name.first}! 🎉</>,
        text: (
          <>Your identity has been verified. You can now enjoy the full features of our platform.</>
        ),
      },
      failed: {
        title: <>Sorry, {user.name.first}. That didn't work. 🤔</>,
        text: (
          <>
            We couldn't verify your identity. Please try again or contact support if you need help.
          </>
        ),
      },
    } satisfies Record<typeof stage, Record<'text' | 'title', React.ReactNode>>
  )[stage];

  return (
    <DashboardCard cols={5} className="py-16 px-10 h-full flex flex-col justify-center gap-8">
      <h4 className="font-semibold text-sm uppercase text-muted-400">
        {user.name.first}'s Account
      </h4>

      <div className="my-auto space-y-8">
        <h2 className="font-medium text-4xl tablet:text-2xl text-muted-800">{title}</h2>
        <p className="font-sans text-muted-500">{text}</p>
      </div>

      {stage === 'idle' ? (
        <Button onClick={showDialog}>
          <VerifiedIcon className="w-4 h-4" />
          Verify my Identity
        </Button>
      ) : (
        <Button onClick={resetAndShowDialog}>
          <RotateCcwIcon className="w-4 h-4" />
          Re-verify Identity
        </Button>
      )}
    </DashboardCard>
  );
}
