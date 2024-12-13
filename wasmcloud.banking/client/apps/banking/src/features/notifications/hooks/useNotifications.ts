import {useNotificationStore} from '../state/store';

export function useNotifications() {
  const store = useNotificationStore();
  return {
    count: store.notifications.length,
    ...store,
  };
}
