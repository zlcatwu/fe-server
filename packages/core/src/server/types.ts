import type {ServerOptions} from 'https';
import type {FastifyRequest, FastifyReply, FastifyInstance, FastifyLoggerOptions} from 'fastify';

export type CreateServeParams = {
  https?: ServerOptions;
  logger?: boolean | FastifyLoggerOptions;
};
export type RegisterServeHandlerParams<T = Record<string | number | symbol, unknown>> = {
  fastify: FastifyInstance;
  handler: ServeHandler;
  extraHandlerParams?: T;
};
export type ServeHandler =
  (params: ServeHandlerParams) => void | Promise<void>
export type ServeHandlerParams = {
  request: FastifyRequest;
  reply: FastifyReply;
};
