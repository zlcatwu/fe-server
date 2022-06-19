import type {PluginHandlerFn, PluginInitFn} from 'fe-server-core';
import {isMatch} from './match';
import {buildMockFilesMap, getMockFile, getMockResult, isMockExists, watchMockFiles} from './mock';
import {InitResult, MockConfig} from './types';
import {formatLog, parsePartialURL} from './utils';

export const name = 'fe-server-sfx-mock';

export const init: PluginInitFn<MockConfig, InitResult> = async (params) => {
  const mockFilesMap = await buildMockFilesMap({
    mockDir: params.config.mockDir,
  });
  const watcher = watchMockFiles({
    mockDir: params.config.mockDir,
    mockFilesMap,
  });
  params.fastify.addHook('onClose', () => {
    watcher.close();
  });
  return {
    mockFilesMap,
  };
};

export const handler: PluginHandlerFn<MockConfig, InitResult> = async (params) => {
  if (!isMatch({
    request: params.request,
    match: params.config.match,
  })) {
    await params.next();
    return;
  }

  const url = parsePartialURL(params.request.url);
  const pathname = params.config.pathnameFormatter ?
    params.config.pathnameFormatter?.({
      pathname: url.pathname,
      search: url.search,
      headers: params.request.headers,
    }) :
    url.pathname;

  const matchPathname = isMockExists({
    mockFilesMap: params.initResult.mockFilesMap,
    pathname,
  });
  if (matchPathname === false) {
    params.request.log.debug(formatLog(`mock file(${pathname}) not exists`));
    await params.next();
    return;
  }

  const mock = await getMockFile({
    mockDir: params.config.mockDir,
    pathname: matchPathname,
  });
  const result = await getMockResult({
    mock,
    method: params.request.method,
    data: params.request.body,
  });
  if (result && !params.reply.sent) {
    params.request.log.info(formatLog(`mock file(${pathname} => ${url}) return`));
    params.reply.send(result);
  }
};

export default {
  name,
  init,
  handler,
};
