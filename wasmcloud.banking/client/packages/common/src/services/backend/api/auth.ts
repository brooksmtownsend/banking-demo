import {ApiSuccessResponse} from '#services/backend/types.ts';
import {apiFetch} from '#services/backend/utils/apiFetch.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {ConfigResponse} from '#services/config/context.tsx';

type AuthResponse = ApiSuccessResponse<{
  valid: boolean;
}>;

export type AuthRequestBody = {
  password: string;
};

function auth(config: ConfigResponse): (requestBody: AuthRequestBody) => Promise<AuthResponse> {
  return (requestBody: AuthRequestBody) => {
    const body = new FormData();

    for (const [key, value] of Object.entries(requestBody)) {
      body.append(key, value);
    }

    return apiFetch(getBaseUrl(config)(config.apiPaths.auth), {
      method: 'POST',
      body,
    });
  };
}

export {auth};
