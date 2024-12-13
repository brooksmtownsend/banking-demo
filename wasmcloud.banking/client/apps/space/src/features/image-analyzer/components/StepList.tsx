import React from 'react';
import {cn} from '@repo/ui/cn';

type StepListProps = {
  [K in keyof JSX.IntrinsicElements]: JSX.IntrinsicElements[K];
}['div'];

const StepList = React.forwardRef<HTMLDivElement, StepListProps>(
  ({className, children, ...props}, ref: React.ForwardedRef<HTMLDivElement>) => {
    return (
      <div className={cn('', className)} {...props} ref={ref}>
        {children}
      </div>
    );
  },
);

export {StepList};
