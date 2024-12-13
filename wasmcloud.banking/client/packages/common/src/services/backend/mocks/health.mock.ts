import {log, secondsBetween} from '#services/backend/mocks/utils.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';

type TaskFunction = typeof import('../api/health').health;

const health: TaskFunction = (config) => () => {
  return new Promise((resolve) => {
    log('health', getBaseUrl(config)(config.apiPaths.health));
    setTimeout(() => {
      resolve({
        error: false,
        data: {
          components: [
            {
              contract: 'api',
              name: 'api',
              region: 'us-east-1',
              status: 'healthy',
            },
            {
              contract: 'api',
              name: 'api',
              region: 'us-west-2',
              status: 'healthy',
            },
            {
              contract: 'api',
              name: 'api',
              region: 'eu-west-1',
              status: 'unhealthy',
            },
          ],
        },
      });
    }, secondsBetween(0.5, 2));
  });
};

export {health};
