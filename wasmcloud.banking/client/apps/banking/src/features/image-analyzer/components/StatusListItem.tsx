import React from 'react';
import {cva} from 'class-variance-authority';
import {
  CircleCheckBigIcon,
  CircleXIcon,
  LoaderCircleIcon,
  SearchCheckIcon,
  SearchXIcon,
  TimerIcon,
} from 'lucide-react';
import {cn} from '@repo/ui/cn';

type StatusListItemProps = {
  text: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  doneStyle?: 'default' | 'positive' | 'negative';
} & React.HTMLProps<HTMLDivElement>;

const styles = cva(
  'flex justify-between border border-transparent items-center text-xs bg-surface px-2 py-1.5 rounded',
  {
    variants: {
      status: {
        idle: 'bg-transparent border-foreground/80',
        processing: 'bg-transparent border-foreground/80',
        error: 'bg-danger border-danger text-accent-foreground',
        done: 'text-accent-foreground',
      },
      doneStyle: {
        default: '',
        positive: '',
        negative: '',
      },
    },
    compoundVariants: [
      {status: 'done', doneStyle: 'default', class: 'bg-accent'},
      {status: 'done', doneStyle: 'positive', class: 'bg-success'},
      {status: 'done', doneStyle: 'negative', class: 'bg-danger'},
    ],
  },
);

const StatusListItem = React.forwardRef<HTMLDivElement, StatusListItemProps>(
  ({text, status, doneStyle = 'default', className, ...props}, ref) => {
    const Icon =
      status === 'error'
        ? CircleXIcon
        : status === 'idle'
        ? TimerIcon
        : status === 'processing'
        ? LoaderCircleIcon
        : doneStyle === 'negative'
        ? SearchXIcon
        : doneStyle === 'positive'
        ? SearchCheckIcon
        : CircleCheckBigIcon;

    return (
      <div
        ref={ref}
        className={cn(
          styles({
            status,
            doneStyle,
          }),
          className,
        )}
        {...props}
      >
        <div className="text-xs">{text}</div>
        <Icon className={cn('w-4 h-4 relative', status === 'processing' && 'animate-spin')} />
      </div>
    );
  },
);

export {StatusListItem};
