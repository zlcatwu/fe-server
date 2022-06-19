import Fastify from 'fastify';
import type {CreateServeParams, RegisterServeHandlerParams} from './types';

export * from './types';

export const createServer = (params: CreateServeParams) => {
  // eslint-disable-next-line new-cap
  const fastify = Fastify({
    https: params.https ? params.https : null,
    logger: params.logger,
  });
  return fastify;
};

export const registerHandler = (params: RegisterServeHandlerParams) => {
  params.fastify.route({
    method: ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
    url: '*',
    handler: (request, reply) => params.handler({
      ...(params.extraHandlerParams ?? {}),
      request,
      reply,
    }),
  });
};
