import {ImmerStateCreator} from '@/state/types';

export type BaseGlobeObject<Data> = 'type' extends keyof Data
  ? Data extends {
      type: infer Type;
      data: infer Data;
    }
    ? {
        id: string;
        name: string;
        type: Type;
        data: Data;
      }
    : never
  : never;

export type GlobePin = BaseGlobeObject<{
  type: 'pin';
  data: {
    location: {
      lat: number;
      long: number;
    };
  };
}>;

type GlobeObject = GlobePin;

type GlobeState = {
  view: 'globe' | 'map';
  objects: GlobeObject[];
};

type GlobeActions = {
  toggleView: () => void;
};

type GlobeSlice = {globe: GlobeState} & GlobeActions;

const createGlobeSlice: ImmerStateCreator<GlobeSlice> = (set) => ({
  globe: {
    view: 'globe',
    objects: [],
  },
  toggleView() {
    set((state) => {
      state.globe.view = state.globe.view === 'globe' ? 'map' : 'globe';
    });
  },
});

export {createGlobeSlice, type GlobeSlice};
