import {Card} from '@repo/ui/Card';

type TaskCardProps = {
  image: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  taskList: React.ReactNode[];
};

function TaskCard({image, title, subtitle, taskList}: TaskCardProps) {
  return (
    <Card className="gap-4 p-0 pr-4 flex">
      <div className="w-52 h-52 rounded-2xl overflow-hidden bg-surface-contrast/5">{image}</div>
      <div className="min-w-52 pb-4 flex flex-col justify-between items-start">
        <div className="py-2.5 flex-col justify-center items-start gap-1.5 flex">
          <div className="text-foreground font-medium">{title}</div>
          <div className="text-foreground/60 text-xs">{subtitle}</div>
        </div>
        <div className="flex flex-col gap-1.5 w-full">{taskList}</div>
      </div>
    </Card>
  );
}

export {TaskCard};
