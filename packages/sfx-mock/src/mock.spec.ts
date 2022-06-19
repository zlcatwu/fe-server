import {buildMockFilesMap, getMockResult, isMockExists} from './mock';
import * as utils from './utils';

describe('isMockExists', () => {
  const mockFilesMap = {
    '/api/login': null,
    '/api/user/{userID}': null,
    '/api/user/{userID}/posts': null,
    '/api/user/{userID}/posts/{postID}': null,
    '/api/logout': null,
  };

  it('normal pathname match', async () => {
    expect(isMockExists({
      mockFilesMap,
      pathname: '/api/login',
    })).toBeTruthy();
  });

  it('dynamic pathname match', async () => {
    expect(isMockExists({
      mockFilesMap,
      pathname: '/api/user/1',
    })).toBeTruthy();

    expect(isMockExists({
      mockFilesMap,
      pathname: '/api/user/2',
    })).toBeTruthy();

    expect(isMockExists({
      mockFilesMap,
      pathname: '/api/user/2/posts',
    })).toBeTruthy();

    expect(isMockExists({
      mockFilesMap,
      pathname: '/api/user/1/categories',
    })).toBeFalsy();
  });

  it('multi dynamic pathname match', async () => {
    expect(isMockExists({
      mockFilesMap,
      pathname: '/api/user/1/posts/2',
    })).toBeTruthy();

    expect(isMockExists({
      mockFilesMap,
      pathname: '/api/user/1/posts/2/comments',
    })).toBeFalsy();
  });
});

describe('buildMockFilesMap', () => {
  beforeEach(async () => {
    jest
        .spyOn(utils, 'globAsync')
        .mockImplementation(async () => [
          'api/login.js',
          'api/user/{userID}.js',
        ]);
  });

  it('should return Record<pathname, null>', async () => {
    const result = await buildMockFilesMap({
      mockDir: '/',
    });
    expect(result).toEqual({
      '/api/login': null,
      '/api/user/{userID}': null,
    });
  });
});

describe('getMockResult', () => {
  it('should prefer method fn', async () => {
    const mock = {
      check: true,
      mockData: () => ({fn: 'mockData'}),
      get: () => ({fn: 'get'}),
    };

    expect(await getMockResult({
      method: 'get',
      mock,
      data: {},
    })).toEqual({
      fn: 'get',
    });

    expect(await getMockResult({
      method: 'post',
      mock,
      data: {},
    })).toEqual({
      fn: 'mockData',
    });
  });

  it('should use mockData when method definition not exists', async () => {
    const result = await getMockResult({
      method: 'get',
      mock: {
        check: true,
        mockData: () => ({fn: 'mockData'}),
      },
      data: {},
    });
    expect(result).toEqual({
      fn: 'mockData',
    });
  });

  it('should return null when disable', async () => {
    expect(await getMockResult({
      method: 'get',
      mock: {
        check: false,
        mockData: () => ({fn: 'mockData'}),
      },
      data: {},
    })).toBe(null);

    expect(await getMockResult({
      method: 'get',
      mock: {
        check: () => false,
        mockData: () => ({fn: 'mockData'}),
      },
      data: {},
    })).toBe(null);

    expect(await getMockResult({
      method: 'get',
      mock: {
        mockData: () => ({fn: 'mockData'}),
      },
      data: {},
    })).toBe(null);
  });
});
