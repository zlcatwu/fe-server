import fastify from 'fastify';
import axios from 'axios';
import createServer from 'fe-server-core';
import proxyPlugin from '../src';
import {ProxyConfig} from '../src/types';
import getPort from 'get-port';

import type {FastifyInstance} from 'fastify';
import type {Plugin} from 'fe-server-core';

describe('fe-server-plugin-proxy', () => {
  type RequestConfig = {
    port: number;
      host: string;
      baseURL: string;
  };
  const targetServers: {
    server: FastifyInstance;
    config: RequestConfig;
    requests: {
      method: string;
      url: string;
      headers: Record<string, string | string[]>;
      data: unknown;
    }[];
  }[] = [];

  let feServer: FastifyInstance;
  let feConfig: RequestConfig;
  const headers = {
    'custom-header': 'value',
  };
  const initTargetServer = async () => {
    const result = await createTargetServer();
    targetServers.push({
      config: result.config,
      server: result.server,
      requests: result.requests,
    });
  };
  const initFeServer = async (plugins: Plugin[]) => {
    {
      const result = await createFeServer(plugins);
      feServer = result.server;
      feConfig = result.config;
    }
  };
  const destroy = async () => {
    await Promise.all(targetServers.map((item) => item.server.close()));
    await feServer.close();
    targetServers.splice(0, targetServers.length);
  };

  describe('simple proxy', () => {
    let targetServer: typeof targetServers[0];
    beforeAll(async () => {
      await initTargetServer();
      targetServer = targetServers[0];
      await initFeServer([
        {
          ...proxyPlugin,
          config: {
            match: '/',
            target: targetServer.config.baseURL,
          },
        } as Plugin<ProxyConfig>,
      ]);
    });

    afterAll(async () => {
      await destroy();
    });

    it('simple GET request proxy', async () => {
      await axios.request({
        url: feConfig.baseURL,
        method: 'GET',
        headers,
      });
      const top = targetServer.requests.pop();
      expect(top?.method.toUpperCase()).toBe('GET');
      expect(top?.url).toBe('/');
      expect(top?.headers['custom-header']).toBe(headers['custom-header']);
    });

    it('simple POST request proxy', async () => {
      const data = {
        key: 'value',
      };
      const path = '/api/login';
      await axios.request({
        url: feConfig.baseURL + path,
        method: 'POST',
        headers,
        data,
      });
      const top = targetServer.requests.pop();
      expect(top?.method.toUpperCase()).toBe('POST');
      expect(top?.url).toBe(path);
      expect(top?.headers['custom-header']).toBe(headers['custom-header']);
      expect(top?.data).toEqual(data);
    });
  });

  describe('proxy to multi target', () => {
    let apiTarget: typeof targetServers[0];
    let uiTarget: typeof targetServers[0];
    beforeAll(async () => {
      await initTargetServer();
      apiTarget = targetServers[0];
      await initTargetServer();
      uiTarget = targetServers[1];
      await initFeServer([
        {
          ...proxyPlugin,
          config: {
            match: '/api',
            target: apiTarget.config.baseURL,
          },
        } as Plugin<ProxyConfig>,
        {
          ...proxyPlugin,
          config: {
            match: '/ui',
            target: uiTarget.config.baseURL,
          },
        } as Plugin<ProxyConfig>,
      ]);
    });

    afterAll(async () => {
      destroy();
    });

    it('prefix with /api should proxy to apiServer', async () => {
      const path = '/api/login';
      await axios.request({
        method: 'GET',
        url: feConfig.baseURL + path,
      });
      const top = apiTarget.requests.pop();
      expect(top?.url).toBe(path);
    });

    it('prefix with /ui should proxy to uiServer', async () => {
      const path = '/ui/index.html';
      await axios.request({
        method: 'GET',
        url: feConfig.baseURL + path,
      });
      const top = uiTarget.requests.pop();
      expect(top?.url).toBe(path);
    });
  });

  describe('modify request and response', () => {
    let targetServer: typeof targetServers[0];
    beforeEach(async () => {
      await initTargetServer();
      targetServer = targetServers[0];
    });

    afterEach(async () => {
      await destroy();
    });

    it('modify request headers', async () => {
      const extraHeaders: Record<string, string> = {
        'custom-header': 'value',
      };
      await initFeServer([
        {
          ...proxyPlugin,
          config: {
            match: '/',
            target: targetServer.config.baseURL,
            requestFormatter: (params) => ({
              ...params,
              headers: {
                ...params.headers,
                ...extraHeaders,
              },
            }),
          },
        } as Plugin<ProxyConfig>,
      ]);
      await axios.request({
        method: 'GET',
        url: feConfig.baseURL,
      });
      const top = targetServer.requests.pop();
      expect(top?.headers['custom-header']).toBe(extraHeaders['custom-header']);
    });

    it('modify request method', async () => {
      const method = 'POST';
      await initFeServer([
        {
          ...proxyPlugin,
          config: {
            match: '/',
            target: targetServer.config.baseURL,
            requestFormatter: (params) => ({
              ...params,
              method,
            }),
          },
        } as Plugin<ProxyConfig>,
      ]);
      await axios.request({
        method: 'GET',
        url: feConfig.baseURL,
      });
      const top = targetServer.requests.pop();
      expect(top?.method).toBe(method);
    });

    it('modify request url', async () => {
      const pathname = '/login';
      const search = '?account=user';
      const replacedSearch = '?account=root';
      const prefix = '/api';
      await initFeServer([
        {
          ...proxyPlugin,
          config: {
            match: '/',
            target: targetServer.config.baseURL,
            requestFormatter: (params) => ({
              ...params,
              pathname: prefix + params.pathname,
              search: replacedSearch,
            }),
          },
        } as Plugin<ProxyConfig>,
      ]);
      await axios.request({
        method: 'GET',
        url: feConfig.baseURL + pathname + search,
      });
      const top = targetServer.requests.pop();
      expect(top?.url).toBe(prefix + pathname + replacedSearch);
    });

    it('modify response headers', async () => {
      const extraHeaders: Record<string, string> = {
        'custom-header': 'value',
      };
      await initFeServer([
        {
          ...proxyPlugin,
          config: {
            match: '/',
            target: targetServer.config.baseURL,
            responseFormatter: (params) => ({
              ...params,
              headers: {
                ...params.headers,
                ...extraHeaders,
              },
            }),
          },
        } as Plugin<ProxyConfig>,
      ]);
      const res = await axios.request({
        method: 'GET',
        url: feConfig.baseURL + '/',
      });
      expect(res.headers['custom-header']).toBe(extraHeaders['custom-header']);
    });
  });
});

const createTargetServer = async () => {
  const port = await getPort();
  const host = '127.0.0.1';
  const config = {
    port: port,
    host,
    baseURL: `http://${host}:${port}`,
  };
  const requests = [] as {
    method: string;
    url: string;
    headers: Record<string, string | string[]>;
    data: unknown;
  }[];
  const server = fastify();
  server.route({
    url: '*',
    method: ['POST', 'GET'],
    handler: (request) => {
      requests.push({
        method: request.method,
        url: request.url,
        headers: request.headers as Record<string, string | string[]>,
        data: request.body,
      });
      return Promise.resolve();
    },
  });
  await server.listen({
    port: config.port,
  });
  return {
    requests,
    server,
    config,
  };
};

const createFeServer = async (plugins: Plugin[] = []) => {
  const port = await getPort();
  const host = '127.0.0.1';
  const config = {
    port,
    host,
    baseURL: `http://${host}:${port}`,
  };
  const server = await createServer({
    port: config.port,
    plugins,
  });
  return {
    server,
    config,
  };
};
