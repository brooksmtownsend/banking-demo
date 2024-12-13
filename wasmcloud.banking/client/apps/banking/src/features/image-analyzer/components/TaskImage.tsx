import React from 'react';
import {cva} from 'class-variance-authority';
import {useConfig} from '@repo/common/services/config/useConfig';
import {getBaseUrl} from '@repo/common/services/backend/utils/getBaseUrl';
import {Task} from '@repo/common/services/backend/types';
import {cn} from '@repo/ui/cn';
import {Loader} from '@repo/ui/Loader';

type TaskImageProps = {
  task?: Task;
  instant?: boolean;
  className?: string;
};

const loader = cva('absolute inset-0 transition duration-1000 flex items-center justify-center', {
  variants: {
    loaded: {
      false: 'opacity-100',
      true: 'opacity-0',
    },
  },
  defaultVariants: {
    loaded: false,
  },
});

const style = cva('object-cover w-full h-full transition duration-1000', {
  variants: {
    loaded: {
      false: 'opacity-0 bg-gradient-to-t from-primary-foreground/10 to-primary-foreground/20',
      true: 'opacity-100',
    },
  },
  defaultVariants: {
    loaded: false,
  },
});

function TaskImage({task, className, instant = false}: TaskImageProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [loadedSrc, setLoadedSrc] = React.useState<string | undefined>();
  const config = useConfig();

  React.useEffect(() => {
    const newSrc = task?.resize?.resized;
    if (!loaded && newSrc !== loadedSrc) setLoaded(false);
  }, [loaded, loadedSrc, task?.resize?.resized]);

  const onLoad = React.useCallback(() => {
    setLoaded(true);
    setLoadedSrc(task?.resize?.resized);
  }, [task?.resize?.resized]);

  const path = task?.resize.resized ? getBaseUrl(config)(`/api/blob/${task?.resize.resized}`) : '';

  return (
    <div className={cn('relative w-full h-full', className)}>
      {instant ? (
        <img src={path} className={cn(style({loaded: true}))} alt="" />
      ) : (
        <>
          <div className={loader({loaded})}>
            <Loader />
          </div>
          <img src={path} onLoad={onLoad} className={cn(style({loaded}))} alt="" />
        </>
      )}
    </div>
  );
}

export {TaskImage};
