import {
  PluginHandlerFnCtx, PluginHandlerFnParams, PluginStorage,
} from 'fe-server-core';
import {createProxyServer} from 'http-proxy';

export type ProxyConfig = {
  target: string;
  match: ProxyMatch;
  requestFormatter?: ProxyRequestFormatter;
  responseFormatter?: ProxyResponseFormatter;
};

export type ProxyInitResult = {
  proxy: ReturnType<typeof createProxyServer>;
};

export type ProxyMatch = string | RegExp | ProxyMatchFn;
export type ProxyMatchFn = (params: ProxyMatchFnParams) => boolean;
export type ProxyMatchFnParams = {
  headers: Record<string, string | string[]>;
  pathname: string;
  search: string;
  method: string;
};
export type ProxyRequestFormatter =
  (params: ProxyRequestFormatterParams) => ProxyRequestFormatterParams;
export type ProxyRequestFormatterParams = ProxyRequestFormatterResult & {
  storage: PluginStorage;
  ctx: PluginHandlerFnCtx;
  config: ProxyConfig;
};
export type ProxyRequestFormatterResult = {
  headers: Record<string, string | string[]>;
  pathname: string;
  search: string;
  method: string;
};
export type ProxyResponseFormatter =
  (params: ProxyResponseFormatterParams) => ProxyResponseFormatterParams;
export type ProxyResponseFormatterParams = ProxyResponseFormatterResult & {
  storage: PluginStorage;
  ctx: PluginHandlerFnCtx;
  config: ProxyConfig;
};
export type ProxyResponseFormatterResult = {
  headers: Record<string, string | string[]>;
};

export type IsMatchParams = {
  request: PluginHandlerFnParams['request'];
  match: ProxyMatch;
};
