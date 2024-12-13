type PersistedStateV1 = {
  imageAnalyzer: {
    status: string;
    activeTaskId: string;
    error: null;
  };
  tasks: {
    jobId: string;
    resize: {
      done: boolean;
      error: boolean;
      original: string;
      resized: string;
    };
    analyze: {
      done: boolean;
      error: boolean;
      match: boolean;
    };
    location: string;
    created_at: string;
    completed_at: string | undefined;
    updated_at: string;
  }[];
};

type PersistedStateV2 = Omit<PersistedStateV1, 'tasks'> & {
  imageAnalyzer: PersistedStateV1['imageAnalyzer'] & {
    tasks: PersistedStateV1['tasks'];
  };
  globe: {
    view: 'globe' | 'map';
    objects: {
      type: string;
      id: string;
      name: string;
      data: unknown;
    }[];
  };
};

function migratedStateV2(persistedState: PersistedStateV1): PersistedStateV2 {
  const {tasks, ...state} = persistedState;
  return {
    ...state,
    imageAnalyzer: {
      ...state.imageAnalyzer,
      tasks: tasks ?? [],
    },
    globe: {
      view: 'globe',
      objects: [],
    },
  };
}

function migrate(persistedState: unknown, version: number) {
  if (version === 1) {
    return migratedStateV2(persistedState as PersistedStateV1);
  }

  return persistedState;
}

export {migrate};
