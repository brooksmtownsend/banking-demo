import {log, secondsBetween} from '#services/backend/mocks/utils.ts';
import {getBaseUrl} from '#services/backend/utils/getBaseUrl.ts';
import {ConfigResponse} from '#services/config/context.tsx';

type AnalyzeFunction = typeof import('../api/analyze').analyze;

const analyze: AnalyzeFunction = (config: ConfigResponse) => (file: File) => {
  return new Promise((resolve) => {
    log('req:', getBaseUrl(config)(config.apiPaths.analyze), {file});
    setTimeout(() => {
      resolve({
        error: false,
        data: {
          jobId: 'job-' + Math.random().toString(36).substring(7),
        },
      });
    }, secondsBetween(0.5, 1));
  });
};

export {analyze};
