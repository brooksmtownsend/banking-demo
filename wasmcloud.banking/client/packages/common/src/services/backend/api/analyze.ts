import {ApiSuccessResponse} from '#services/backend/types.ts';
import {apiFetch} from '#services/backend/utils/apiFetch.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {isApiSuccessResponse} from '#services/backend/utils/typeGuards.ts';
import {ConfigResponse} from '#services/config/context.tsx';

type AnalyzeResponse = ApiSuccessResponse<{
  jobId: string;
}>;

function analyze(config: ConfigResponse) {
  return async (file: File) => {
    const body = new FormData();
    body.append('image', file);

    return apiFetch(
      getBaseUrl(config)(config.apiPaths.analyze),
      {
        method: 'POST',
        body,
      },
      isAnalyzeResponse,
    );
  };
}

function isAnalyzeResponse(res: unknown): res is AnalyzeResponse {
  return isApiSuccessResponse(res);
}

export {analyze};
