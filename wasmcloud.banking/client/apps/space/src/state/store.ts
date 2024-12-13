import {STORAGE_KEY} from '@/env';
import {createGlobeSlice, GlobeSlice} from '@/features/globe/state/slice';
import {createImageAnalyzerSlice, ImageAnalyzerSlice} from '@/features/image-analyzer/state/slice';
import {migrate} from '@/state/migrate';
import {useStore} from 'zustand';
import {persist, devtools, createJSONStorage} from 'zustand/middleware';
import {immer} from 'zustand/middleware/immer';
import {createStore} from 'zustand/vanilla';

type RootStore = ImageAnalyzerSlice & GlobeSlice;

const appStateCreator = immer<RootStore>((...args) => ({
  ...createGlobeSlice(...args),
  ...createImageAnalyzerSlice(...args),
}));

function getTypedValue<S extends Record<string, unknown>, K extends keyof S = keyof S>(
  _key: K,
  value: unknown,
): S[K] {
  return value as S[K];
}

const reviver = (k: string, v: unknown) => {
  if (k === 'imageAnalyzer') {
    const value = getTypedValue<RootStore, typeof k>(k, v);

    let status = value.status;
    if (status === 'uploading' || status === 'processing') status = 'idle';

    return {...value, status, tasks: value.tasks ?? []};
  }
  return v;
};

const rootStore = createStore<RootStore>()(
  devtools(
    persist(appStateCreator, {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage, {
        reviver,
      }),
      migrate,
      version: 2,
    }),
    {
      enabled: import.meta.env.DEV,
    },
  ),
);

function useRootStore(): RootStore;
function useRootStore<T>(selector: (state: RootStore) => T): T;
function useRootStore<T>(selector?: (state: RootStore) => T) {
  return useStore(rootStore, selector!);
}

export {useRootStore, rootStore};
export type {RootStore};
