import getPort from 'get-port';
import type {FeServerConfig} from './types';

export const mergeConfig = async (params: FeServerConfig) => {
  return {
    ...params,
    port: params.port ?? await getPort(),
    host: params.host ?? '0.0.0.0',
    logger: params.logger ?? {
      level: 'info',
    },
  } as FeServerConfig;
};
