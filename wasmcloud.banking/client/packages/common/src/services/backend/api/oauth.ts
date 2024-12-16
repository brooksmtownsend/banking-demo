import {ApiSuccessResponse} from '#services/backend/types.ts';
import {apiFetch} from '#services/backend/utils/apiFetch.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {isApiSuccessResponse} from '#services/backend/utils/typeGuards.ts';
import {ConfigResponse} from '#services/config/context.tsx';

type OauthCallbackResponse = ApiSuccessResponse<string>;

function oauthCallback(config: ConfigResponse) {
  return async (code: string | null, state: string | null) => {
    return apiFetch(
      getBaseUrl(config)(
        config.apiPaths.oauthCallback.replace(':code', code || '').replace(':state', state || ''),
      ),
      {
        method: 'Get',
      },
      isTransactionsResponse,
    );
  };
}

function isTransactionsResponse(res: unknown): res is OauthCallbackResponse {
  return isApiSuccessResponse(res);
}

export {oauthCallback as oauthCallback};
