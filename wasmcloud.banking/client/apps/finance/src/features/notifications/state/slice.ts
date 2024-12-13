import {ImmerStateCreator} from '@/state/types';

type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

type NotificationStatic = {
  id: string;
  message: string;
  priority: NotificationPriority;
};

type NotificationClickable = {
  onClick: () => void;
  buttonText: string;
} & NotificationStatic;

type NotificationEntry = NotificationStatic | NotificationClickable;

type NotificationState = {
  notifications: NotificationEntry[];
};

type NotificationActions = {
  notify(message: string, priority?: NotificationPriority): void;
  dismiss(id: string): void;
  clearAll(): void;
};

type NotificationStore = NotificationState & NotificationActions;

const createNotificationSlice: ImmerStateCreator<NotificationStore, NotificationStore> = (set) => ({
  notifications: [{id: '1', message: 'You need to verify your account', priority: 'medium'}],
  notify: (message, priority = 'medium') =>
    set((state) => {
      state.notifications.push({id: Math.random().toString(36).slice(2, 9), message, priority});
    }),
  dismiss: (id) =>
    set((state) => {
      state.notifications = state.notifications.filter((n) => n.id !== id);
    }),
  clearAll: () =>
    set((state) => {
      state.notifications = [];
    }),
});

export {
  createNotificationSlice,
  type NotificationStore,
  type NotificationPriority,
  type NotificationEntry,
};
