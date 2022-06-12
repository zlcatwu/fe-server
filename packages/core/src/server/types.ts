import type {ServerOptions} from 'https';
import type {FastifyRequest, FastifyReply} from 'fastify';

export type ServeParams = {
  port: number;
  handler: ServeHandler;
  extraHandlerParams?: Record<string | number | symbol, any>;
  https?: ServerOptions;
};
export type ServeHandler =
  (params: ServeHandlerParams) => void | Promise<void>
export type ServeHandlerParams = {
  request: FastifyRequest;
  reply: FastifyReply;
};
