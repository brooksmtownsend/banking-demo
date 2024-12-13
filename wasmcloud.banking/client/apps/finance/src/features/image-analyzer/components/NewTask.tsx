import React from 'react';
import {TaskCard} from './TaskCard';
import {StatusListItem} from './StatusListItem';

type NewTaskProps = React.PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

function NewTask({children, title, subtitle}: NewTaskProps) {
  return (
    <TaskCard
      image={<div className="p-4 flex items-stretch h-full">{children}</div>}
      title={title}
      subtitle={subtitle}
      taskList={[
        <StatusListItem className="opacity-50" key="upload" text="Upload" status="idle" />,
        <StatusListItem className="opacity-50" key="resize" text="Resize" status="idle" />,
        <StatusListItem className="opacity-50" key="analyze" text="Analyze" status="idle" />,
      ]}
    />
  );
}

export {NewTask};
