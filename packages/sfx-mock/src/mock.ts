import path from 'path';
import chokidar from 'chokidar';

import type {BuildMockFilesMapParams, GetMockFileParams, GetMockFileReturn, GetMockResultParams, IsMockExistsParams, SfxMockFn, WatchMockFilesParams} from './types';
import {globAsync} from './utils';

export const isMockExists = (params: IsMockExistsParams) => {
  if (typeof params.mockFilesMap[params.pathname] !== 'undefined') {
    return params.pathname;
  }
  const dynamicRegexp = /\{[^/]+\}/g;
  const toCheck = Object.keys(params.mockFilesMap)
      .filter((filepath) => filepath.match(dynamicRegexp));
  for (const filepath of toCheck) {
    const regexp = new RegExp(filepath.replace(dynamicRegexp, '[^/]+') + '$');
    if (regexp.test(params.pathname)) {
      return filepath;
    }
  }
  return false;
};

export const buildMockFilesMap = async (params: BuildMockFilesMapParams) => {
  const files = await globAsync('**/*.js', {
    cwd: params.mockDir,
  });
  const result = files
      .map((file) => '/' + file.replace(path.extname(file), ''))
      .reduce((pre, cur) => {
        pre[cur] = null;
        return pre;
      }, {} as Record<string, boolean | null>);

  return result;
};

export const watchMockFiles = (params: WatchMockFilesParams) => {
  return chokidar
      .watch(params.mockDir)
      .on('add', (filepath) => {
        if (!filepath.endsWith('.js')) {
          return;
        }
        params.mockFilesMap[filepath.replace(path.extname(filepath), '')] = null;
      })
      .on('unlink', (filepath) => {
        if (!filepath.endsWith('.js')) {
          return;
        }
        delete params.mockFilesMap[filepath.replace(path.extname(filepath), '')];
      });
};

export const getMockFile = async (params: GetMockFileParams) => {
  const filepath = params.mockDir + params.pathname;
  delete require.cache[require.resolve(filepath)];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mock = require(filepath);
  return mock as GetMockFileReturn;
};

export const getMockResult = async (params: GetMockResultParams) => {
  if (
    !params.mock.check ||
    (typeof params.mock.check === 'function' && !params.mock.check?.())
  ) {
    return null;
  }
  const method = params.method.toLocaleLowerCase();
  const targetFn: SfxMockFn = params.mock[method] ?? params.mock.mockData;
  const result = await targetFn?.({
    data: params.data,
  });
  return result ?? null;
};
