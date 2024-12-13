import {useStore} from 'zustand';
import {devtools} from 'zustand/middleware';
import {immer} from 'zustand/middleware/immer';
import {createStore} from 'zustand/vanilla';
import {createSettingsSlice, SettingsStore} from '@/features/settings/state/slice';

const settingsStore = createStore<SettingsStore>()(
  devtools(
    immer<SettingsStore>((...args) => ({
      ...createSettingsSlice(...args),
    })),
    {
      enabled: import.meta.env.DEV,
    },
  ),
);

function useSettingsStore(): SettingsStore;
function useSettingsStore<T>(selector: (state: SettingsStore) => T): T;
function useSettingsStore<T>(selector?: (state: SettingsStore) => T) {
  return useStore(settingsStore, selector!);
}

export {useSettingsStore, settingsStore};
export type {SettingsStore};
