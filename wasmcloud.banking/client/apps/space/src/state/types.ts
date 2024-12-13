import type {StateCreator} from 'zustand';
import type {RootStore} from './store';

type ImmerStateCreator<Slice, Store = RootStore> = StateCreator<
  Store,
  [['zustand/immer', never], never],
  [],
  Slice
>;

type RootStateCreator = ImmerStateCreator<RootStore>;

type SliceCreator<TSlice extends keyof RootStore> = (
  ...params: Parameters<RootStateCreator>
) => Pick<ReturnType<RootStateCreator>, TSlice>;

export type {ImmerStateCreator, SliceCreator};
