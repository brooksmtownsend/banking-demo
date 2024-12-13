import {ImmerStateCreator} from '@/state/types';

type DashboardState = {
  dialog: {
    open: boolean;
  };
};

type DashboardActions = {
  showDialog(): void;
  hideDialog(): void;
};

type DashboardStore = DashboardState & DashboardActions;

const createDashboardSlice: ImmerStateCreator<DashboardStore, DashboardStore> = (set) => ({
  dialog: {
    open: false,
  },
  showDialog: () =>
    set((state) => {
      state.dialog.open = true;
    }),
  hideDialog: () =>
    set((state) => {
      state.dialog.open = false;
    }),
});

export {createDashboardSlice, type DashboardStore};
