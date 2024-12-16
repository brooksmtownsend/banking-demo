import React from 'react';

export type ConfigResponse = {
  baseUrl: string;
  appName: string;
  apiPaths: {
    tasks: string;
    task: string;
    analyze: string;
    health: string;
    auth: string;
    transactions: string;
    oauthCallback: string;
    createUser: string;
  };
};

const DEFAULT_CONFIG: ConfigResponse = {
  baseUrl: '/',
  appName: 'wasmCloud Banking',
  apiPaths: {
    tasks: '/api/tasks',
    task: '/api/tasks/:id',
    analyze: '/api/analyze',
    health: '/api/health',
    auth: '/api/auth',
    transactions: '/accounts/:id/transactions',
    oauthCallback: '/auth/callback?code=:code&state=:state',
    createUser: '/accounts/:id',
  },
};

const ConfigContext = React.createContext<ConfigResponse | undefined>(undefined);

const mergeConfig = (config: ConfigResponse) => {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    apiPaths: {...DEFAULT_CONFIG.apiPaths, ...config.apiPaths},
  };
};

function getConfigJson(): {read: () => ConfigResponse} {
  let response: ConfigResponse | undefined = undefined;
  const promise = fetch('/config.json')
    .then((res) => res.json() as Promise<ConfigResponse>)
    .then((res) => (response = res))
    .catch((err) => {
      console.error('Failed to load config.json:', err);
      response = DEFAULT_CONFIG;
    });

  return {
    read: () => {
      if (typeof response !== 'undefined') return mergeConfig(response);
      throw promise;
    },
  };
}

const configLoader = getConfigJson();

function ConfigProvider({children}: React.PropsWithChildren) {
  const config = configLoader.read();

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export {ConfigContext, ConfigProvider};
