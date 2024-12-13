import {useStore} from 'zustand';
import {devtools} from 'zustand/middleware';
import {immer} from 'zustand/middleware/immer';
import {createStore} from 'zustand/vanilla';
import {createNotificationSlice, NotificationStore} from './slice';

const rootStore = createStore<NotificationStore>()(
  devtools(
    immer<NotificationStore>((...args) => ({
      ...createNotificationSlice(...args),
    })),
    {
      enabled: import.meta.env.DEV,
    },
  ),
);

function useNotificationStore(): NotificationStore;
function useNotificationStore<T>(selector: (state: NotificationStore) => T): T;
function useNotificationStore<T>(selector?: (state: NotificationStore) => T) {
  return useStore(rootStore, selector!);
}

export {useNotificationStore, rootStore};
export type {NotificationStore};
