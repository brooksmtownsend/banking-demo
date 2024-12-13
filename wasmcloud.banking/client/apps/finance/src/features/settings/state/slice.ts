import {ImmerStateCreator} from '@/state/types';

type SettingsState = {
  dialog: {
    open: boolean;
  };
  status: 'idle' | 'loading' | 'error' | 'loggedIn';
  error: string | undefined;
};

type SettingsActions = {
  showDialog(): void;
  hideDialog(): void;
  login(): void;
  logout(): void;
  loading(): void;
  handleError(e: Error): void;
};

type SettingsStore = SettingsState & SettingsActions;

const createSettingsSlice: ImmerStateCreator<SettingsStore, SettingsStore> = (set) => ({
  dialog: {
    open: false,
  },
  status: 'idle',
  error: undefined,
  showDialog: () =>
    set((state) => {
      state.dialog.open = true;
    }),
  hideDialog: () =>
    set((state) => {
      state.dialog.open = false;
    }),
  loading: () =>
    set((state) => {
      state.status = 'loading';
    }),
  login: () =>
    set((state) => {
      state.status = 'loggedIn';
    }),
  logout: () =>
    set((state) => {
      state.status = 'idle';
    }),
  handleError: (e: Error) =>
    set((state) => {
      state.status = 'error';
      state.error = e.message;
    }),
});

export {createSettingsSlice, type SettingsStore};
