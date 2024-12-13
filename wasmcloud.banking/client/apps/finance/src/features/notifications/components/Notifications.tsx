import * as React from 'react';
import {BellIcon, XIcon} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/Dropdown';
import {useNotifications} from '../hooks/useNotifications';
import {NotificationEntry, NotificationPriority} from '../state/slice';

export function NotificationButton() {
  const {count} = useNotifications();
  const label = count === 1 ? '1 Notification' : `${count} Notifications`;
  return (
    <DropdownMenuTrigger asChild>
      <div className="w-auto h-full relative" aria-label={label}>
        {count >= 1 && (
          <div className="absolute right-0 block w-2.5 h-2.5 rounded-full bg-danger" />
        )}
        <BellIcon className="w-auto h-full" />
      </div>
    </DropdownMenuTrigger>
  );
}

export function NotificationItem({
  notification,
  onClose,
}: {
  notification: NotificationEntry;
  onClose: () => void;
}) {
  return (
    <div className="border border-border text-xs rounded">
      <div className="flex justify-between items-start gap-1.5 px-2 py-2.5">
        <NotificationIcon priority={notification.priority} />
        <div>
          <div>{notification.message}</div>
          {'onClick' in notification && (
            <button
              className="text-foreground underline opacity-50 hover:opacity-100 hover:underline"
              onClick={notification.onClick}
            >
              {notification.buttonText}
            </button>
          )}
        </div>
        <button onClickCapture={onClose} className="text-foreground opacity-50 hover:opacity-100">
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function NotificationIcon({priority}: {priority: NotificationPriority}) {
  switch (priority) {
    case 'low':
      return <BellIcon className="w-4 h-4 text-primary-foreground" />;
    case 'medium':
      return <BellIcon className="w-4 h-4 text-warning" />;
    case 'high':
      return <BellIcon className="w-4 h-4 text-danger" />;
    case 'critical':
      return <BellIcon className="w-4 h-4 text-danger" />;
  }
}

export function NotificationDropdown() {
  const {notifications, dismiss} = useNotifications();
  return (
    <DropdownMenuContent className="w-56" side="bottom" align="end">
      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => dismiss(notification.id)}
          />
        ))}
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
}

export function Notifications({children}: React.PropsWithChildren) {
  return <DropdownMenu>{children}</DropdownMenu>;
}
