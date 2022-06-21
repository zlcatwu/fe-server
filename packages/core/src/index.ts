import {FeServerConfig} from './config/types';
import {mergeConfig} from './config';

export * from './server';
export * from './plugin';

import * as server from './server';
import * as plugin from './plugin';

export default async (config: FeServerConfig) => {
  const mergedConfig = await mergeConfig(config);
  const storage = plugin.createPluginStorage();
  const handledPlugins = config.plugins.map(plugin.preHandle);
  const fastify = server.createServer({
    https: config.https,
    logger: mergedConfig.logger,
  });
  const initResult = await plugin.init({
    fastify,
    storage,
    plugins: handledPlugins,
  });
  const handler = plugin.composeHandler({
    plugins: handledPlugins,
    storage,
    initResult,
  });
  server.registerHandler({
    fastify,
    handler,
    extraHandlerParams: {
      storage,
      initResult,
    },
  });
  await fastify.listen({
    host: mergedConfig.host,
    port: mergedConfig.port,
  });
  return fastify;
};
