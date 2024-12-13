import React from 'react';
import {TaskCard} from './TaskCard';
import {StatusListItem} from './StatusListItem';

type ErrorTaskProps = React.PropsWithChildren<{
  message: string;
}>;

function ErrorTask({children, message}: ErrorTaskProps) {
  return (
    <TaskCard
      image={<div className="p-4 flex items-stretch h-full">{children}</div>}
      title="Error"
      subtitle={message}
      taskList={[
        <StatusListItem key="upload" text="Upload" status="error" />,
        <StatusListItem className="opacity-50" key="resize" text="Resize" status="idle" />,
        <StatusListItem className="opacity-50" key="analyze" text="Analyze" status="idle" />,
      ]}
    />
  );
}

export {ErrorTask};
