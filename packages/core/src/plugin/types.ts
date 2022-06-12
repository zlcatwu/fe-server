import {getPluginStorage} from '.';
import type {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';

export type InitParams = {
  fastify: FastifyInstance;
  plugins: Plugin[];
  storage: PluginStorage;
};

export type Plugin = {
  name: string;
  config?: Record<string | number | symbol, any> & PluginCommonConfig;
  init?: PluginInitFn;
  handler?: PluginHandlerFn;
};
export type PluginCommonConfig = {
  enable?: boolean;
};

export type ComposeHandlerParams = {
  plugins: Plugin[];
  storage: PluginStorage;
};
export type PluginInitFn = (params: PluginInitFnParams) => void | Promise<void>;
export type PluginStorage = ReturnType<typeof getPluginStorage>;
export type PluginInitFnParams = {
  fastify: FastifyInstance;
  storage: PluginStorage;
  config: Plugin['config'];
};
export type PluginHandlerFn =
  (params: PluginHandlerFnParams) => void | Promise<void>;
export type PluginHandlerFnParams = {
  request: FastifyRequest;
  reply: FastifyReply;
  storage: PluginStorage;
  config: Plugin['config'];
  ctx?: PluginHandlerFnCtx;
  next?: PluginHandlerFnNext;
};
export type PluginHandlerFnNext = () => void | Promise<void>;
export type PluginHandlerFnCtx = PluginStorage;
