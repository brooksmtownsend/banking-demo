import {createDashboardSlice, DashboardStore} from '@/features/dashboard/state/slice';
import {useStore} from 'zustand';
import {devtools} from 'zustand/middleware';
import {immer} from 'zustand/middleware/immer';
import {createStore} from 'zustand/vanilla';

const rootStore = createStore<DashboardStore>()(
  devtools(
    immer<DashboardStore>((...args) => ({
      ...createDashboardSlice(...args),
    })),
    {
      enabled: import.meta.env.DEV,
    },
  ),
);

function useDashboardStore(): DashboardStore;
function useDashboardStore<T>(selector: (state: DashboardStore) => T): T;
function useDashboardStore<T>(selector?: (state: DashboardStore) => T) {
  return useStore(rootStore, selector!);
}

export {useDashboardStore, rootStore};
export type {DashboardStore};
