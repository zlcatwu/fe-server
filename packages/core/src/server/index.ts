import Fastify from 'fastify';
import type {ServeParams} from './types';

export * from './types';

export const serve = async (params: ServeParams) => {
  // eslint-disable-next-line new-cap
  const fastify = Fastify({
    https: params.https ? params.https : null,
  });
  fastify.route({
    method: ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
    url: '/',
    handler: (request, reply) => params.handler({
      ...(params.extraHandlerParams ?? {}),
      request,
      reply,
    }),
  });
  await fastify.listen({
    port: params.port,
  });
  return fastify;
};

