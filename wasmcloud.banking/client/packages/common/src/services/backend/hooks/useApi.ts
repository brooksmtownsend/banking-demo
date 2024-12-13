import {useConfig} from '#services/config/useConfig.ts';
import {oauthCallback} from '../api/oauth';

type ApiServices = typeof import('../api').default;

function loadApi() {
  const params = new URLSearchParams(window.location.search);
  let response: ApiServices | undefined = undefined;
  const api = params.get('api') || 'default';
  console.log('Using API:', api);

  const promise = Promise.resolve(
    api === 'v2'
      ? import('#services/backend/mocks/index.ts')
      : import('#services/backend/api/index.ts'),
  ).then((res) => (response = res.default));

  return {
    load() {
      if (response === undefined) throw promise;

      return response;
    },
  };
}

const apiLoader = loadApi();

function useApi() {
  const config = useConfig();

  const api = apiLoader.load();

  return {
    analyze: api.analyze(config),
    health: api.health(config),
    tasks: api.tasks(config),
    task: api.task(config),
    auth: api.auth(config),
    transactions: api.transactions(config),
    oauthCallback: api.oauthCallback(config),
    createUser: api.createUser(config),
  };
}

export {useApi};
