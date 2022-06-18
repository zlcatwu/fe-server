import {createPluginStorage} from '.';
import type {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';

export type PluginCommonConfig = {
  enable?: boolean;
};
export type PluginCustomConfig = Record<string | number | symbol, unknown>;
export type PluginConfig = PluginCommonConfig & PluginCustomConfig;
export type InitParams<T = PluginConfig> = {
  fastify: FastifyInstance;
  plugins: Plugin<T>[];
  storage: PluginStorage;
};

export type Plugin<T = PluginConfig> = {
  name: string;
  config?: T & PluginCommonConfig;
  init?: PluginInitFn;
  handler?: PluginHandlerFn;
};

export type ComposeHandlerParams<T = PluginConfig> = {
  plugins: Plugin<T>[];
  storage: PluginStorage;
  initResult: Map<Plugin, unknown>;
};
export type PluginInitFn<T = PluginConfig, R = unknown>
  = (params: PluginInitFnParams<T>) => R | Promise<R>;
export type PluginStorage = ReturnType<typeof createPluginStorage>;
export type PluginInitFnParams<T = PluginConfig> = {
  fastify: FastifyInstance;
  storage: PluginStorage;
  config: Plugin<T>['config'];
};
export type PluginHandlerFn<T = PluginConfig, R = unknown> =
  (params: PluginHandlerFnParams<T, R>) => void | Promise<void>;
export type PluginHandlerFnParams<T = PluginConfig, R = unknown> = {
  request: FastifyRequest;
  reply: FastifyReply;
  storage: PluginStorage;
  config: Plugin<T>['config'];
  next: PluginHandlerFnNext;
  ctx: PluginHandlerFnCtx;
  initResult: R;
};
export type PluginHandlerFnNext = () => void | Promise<void>;
export type PluginHandlerFnCtx = PluginStorage;
