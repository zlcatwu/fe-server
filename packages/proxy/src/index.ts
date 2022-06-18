import httpProxy from 'http-proxy';

import type {PluginHandlerFn, PluginInitFn} from 'fe-server-core';
import {ProxyConfig, ProxyInitResult} from './types';
import {parsePartialURL} from './utils';
import {isMatch} from './match';
import {Readable} from 'stream';

export const name = 'fe-server-proxy';

export const init: PluginInitFn<ProxyConfig, ProxyInitResult> = async (params) => {
  const proxy = httpProxy.createProxyServer({
    target: params.config.target,
    changeOrigin: true,
  });
  return {
    proxy,
  };
};

export const handler: PluginHandlerFn<ProxyConfig, ProxyInitResult> = async (params) => {
  if (!isMatch({
    match: params.config.match,
    request: params.request,
  })) {
    await params.next();
    return;
  }
  const proxy = params.initResult.proxy;
  if (!params.reply.sent) {
    proxy.web(params.request.raw, params.reply.raw, {
      target: params.config.target,
      buffer: params.request.body ?
        Readable.from(Buffer.from(JSON.stringify(params.request.body))) :
        undefined,
    }, params.next);
    params.reply.hijack();
  }
  params.config.requestFormatter && proxy.on('proxyReq', (proxyReq, req) => {
    const url = parsePartialURL(req.url);
    const headers = proxyReq.getHeaders() as Record<string, string | string[]>;
    const formatted = params.config.requestFormatter({
      headers,
      pathname: url.pathname,
      search: url.search,
      method: proxyReq.method,
      storage: params.storage,
      ctx: params.ctx,
      config: params.config,
    });
    // remove all headers and set headers from formatted
    Object.keys(headers).forEach((key) => {
      proxyReq.removeHeader(key);
    });
    Object.keys(formatted.headers).forEach((key) => {
      proxyReq.setHeader(key, formatted.headers[key]);
    });
    proxyReq.path = formatted.pathname + formatted.search;
    proxyReq.method = formatted.method;
  });
  params.config.responseFormatter && proxy.on('proxyRes', (proxyRes) => {
    const formatted = params.config.responseFormatter({
      headers: proxyRes.headers,
      storage: params.storage,
      ctx: params.ctx,
      config: params.config,
    });
    proxyRes.headers = formatted.headers;
  });
};

export default {
  name,
  handler,
  init,
};
