import {ApiSuccessResponse} from '#services/backend/types.ts';
import {apiFetch} from '#services/backend/utils/apiFetch.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {ConfigResponse} from '#services/config/context.tsx';

export type ComponentHealth = {
  name: string;
  contract: string;
  status: 'healthy' | 'unhealthy';
  region: string;
};

type HealthResponse = ApiSuccessResponse<{
  components: ComponentHealth[];
}>;

function health(config: ConfigResponse): () => Promise<HealthResponse> {
  return () => apiFetch(getBaseUrl(config)(config.apiPaths.health));
}

export {health};
