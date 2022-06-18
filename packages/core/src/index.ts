import {FeServerConfig} from './config/types';

export * from './server';
export * from './plugin';

import * as server from './server';
import * as plugin from './plugin';

export default async (config: FeServerConfig) => {
  const storage = plugin.createPluginStorage();
  const handledPlugins = config.plugins.map(plugin.preHandle);
  const fastify = server.createServer({
    https: config.https,
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
    port: config.port,
  });
  return fastify;
};
