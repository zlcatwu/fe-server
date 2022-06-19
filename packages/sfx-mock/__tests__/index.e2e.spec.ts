import createServer from 'fe-server-core';
import getPort from 'get-port';
import temp from 'temp';
import axios from 'axios';
import fs from 'fs-extra';
import sfxMockPlugin from '../src/index';

import type {MockConfig} from '../src/types';
import type {Plugin} from 'fe-server-core';

describe('fe-server-plugin-sfx-mock', () => {
  let feServer: Awaited<ReturnType<typeof createServer>>;
  let feConfig: RequestConfig;
  let mockDir: string;

  const initFeServer = async (plugins: Plugin[]) => {
    {
      const result = await createFeServer(plugins);
      feServer = result.server;
      feConfig = result.config;
    }
  };
  const destroy = async () => {
    await feServer.close();
  };

  describe('simple mock', () => {
    const loginMock: MockFile = {
      pathname: '/api/login',
      check: 'true',
      mockData: {
        username: 'root',
      },
      post: {
        username: 'admin',
      },
    };
    const userMock: MockFile = {
      pathname: '/api/user/{userID}',
      check: '() => true',
      mockData: {
        username: 'root',
      },
    };
    const postMock: MockFile = {
      pathname: '/api/post/1',
      check: 'false',
      mockData: {
        title: 'post',
      },
    };
    beforeAll(async () => {
      temp.track();
      mockDir = await temp.mkdir('mock');
      await initMockFiles({
        mockDir,
        files: [
          loginMock,
          userMock,
          postMock,
        ],
      });
      await initFeServer([
        {
          ...sfxMockPlugin,
          config: {
            mockDir,
            match: '/',
          },
        } as Plugin<MockConfig>,
      ]);
    });

    afterAll(async () => {
      await destroy();
    });

    it('no mock match should not handle', async () => {
      const res = await axios.request({
        method: 'GET',
        url: feConfig.baseURL,
      });
      expect(res.data === '');
    });

    it('static mock match', async () => {
      {
        const res = await axios.request({
          method: 'GET',
          url: feConfig.baseURL + loginMock.pathname,
        });
        expect(res.data).toEqual(loginMock.mockData);
      }

      {
        const res = await axios.request({
          method: 'POST',
          url: feConfig.baseURL + loginMock.pathname,
          data: {},
        });
        expect(res.data).toEqual(loginMock.post);
      }
    });

    it('dynamic mock match', async () => {
      const res = await axios.request({
        method: 'GET',
        url: feConfig.baseURL + userMock.pathname.replace('{userID}', '1'),
      });
      expect(res.data).toEqual(userMock.mockData);
    });
  });
});

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
    logger: true,
  });
  return {
    server,
    config,
  };
};

type RequestConfig = {
  port: number;
  host: string;
  baseURL: string;
};

const initMockFiles = async (params: InitMockFilesParams) => {
  for (const file of params.files) {
    const data = [
      formatCheck(file.check),
      formatMethodFn('mockData', file.mockData),
      formatMethodFn('get', file.get),
      formatMethodFn('post', file.post),
    ].join('\n');
    const filepath = params.mockDir + file.pathname + '.js';
    await fs.ensureFile(filepath);
    await fs.writeFile(filepath, data);
  }
};
const formatCheck = (check?: string) => typeof check !== 'undefined' ?
  `exports.check = ${check}` : '';
const formatMethodFn = (method: string, data: unknown) => typeof data !== 'undefined' ?
  `exports.${method} = () => (${JSON.stringify(data)})` : '';
type InitMockFilesParams = {
  files: MockFile[];
  mockDir: string;
};
type MockFile = {
  pathname: string;
  check?: string;
  mockData?: unknown;
  get?: unknown;
  post?: unknown;
};
