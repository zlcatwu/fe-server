import {PluginHandlerFnParams} from 'fe-server-core';
import {buildMockFilesMap} from './mock';

export type MockConfig = {
  mockDir: string;
  match: MockMatch;
  pathnameFormatter?: (params: PathnameFormatterParams) => string;
};
export type PathnameFormatterParams = {
  headers: Record<string, string | string[]>;
  pathname: string;
  search: string;
};

export type MockMatch = string | RegExp | MockMatchFn;
export type MockMatchFn = (params: MockMatchFnParams) => boolean;
export type MockMatchFnParams = {
  headers: Record<string, string | string[]>;
  pathname: string;
  search: string;
  method: string;
};

export type IsMatchParams = {
  request: PluginHandlerFnParams['request'];
  match: MockMatch;
};

export type MockFilesMap = Record<string, boolean | null>;
export type InitResult = {
  mockFilesMap: MockFilesMap;
};

// Mock types
export type IsMockExistsParams = {
  pathname: string;
  mockFilesMap: MockFilesMap;
};

export type BuildMockFilesMapParams = {
  mockDir: string;
};

export type WatchMockFilesParams = {
  mockDir: string;
  mockFilesMap: Awaited<ReturnType<typeof buildMockFilesMap>>;
};

export type GetMockFileParams = {
  pathname: string;
  mockDir: string;
};

export type GetMockFileReturn = {
  check?: (() => boolean) | boolean;
  mockData?: SfxMockFn;
  get?: SfxMockFn;
  post?: SfxMockFn;
  put?: SfxMockFn;
  patch?: SfxMockFn;
  delete?: SfxMockFn;
};

export type SfxMockFn = (params: SfxMockFnParams) => unknown;
export type SfxMockFnParams = {
  data: unknown;
};

export type GetMockResultParams = {
  mock: GetMockFileReturn;
  method: string;
  data: unknown;
};
