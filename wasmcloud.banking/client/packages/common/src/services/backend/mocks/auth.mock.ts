import {log, secondsBetween} from '#services/backend/mocks/utils.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {ConfigResponse} from '#services/config/context.tsx';

type AuthFunction = typeof import('../api/auth').auth;
type AuthRequestBody = ReturnType<AuthFunction> extends (args: infer T) => any ? T : never;

const auth: AuthFunction =
  (config: ConfigResponse) =>
  ({password}: AuthRequestBody) => {
    return new Promise((resolve) => {
      log('req:', getBaseUrl(config)(config.apiPaths.auth), {password});
      setTimeout(() => {
        resolve({
          error: false,
          data: {
            valid: true,
          },
        });
      }, secondsBetween(0.5, 1));
    });
  };

export {auth};
