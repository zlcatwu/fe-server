/* eslint-disable @typescript-eslint/no-empty-function */
import {isMatch} from './match';
import {IsMatchParams} from './types';

describe('isMatch', () => {
  const commonRequest = {
    log: {
      debug: (() => {}) as IsMatchParams['request']['log']['debug'],
    },
  };

  it('string to match url prefix', () => {
    expect(
        isMatch({
          match: '/api',
          request: {
            ...commonRequest,
            url: '/api/login',
          } as IsMatchParams['request'],
        }),
    ).toBeTruthy();

    expect(
        isMatch({
          match: '/ui',
          request: {
            ...commonRequest,
            url: '/api/login',
          } as IsMatchParams['request'],
        }),
    ).toBeFalsy();
  });

  it('regexp to match url', () => {
    expect(
        isMatch({
          match: /api/,
          request: {
            ...commonRequest,
            url: '/api/login',
          } as IsMatchParams['request'],
        }),
    ).toBeTruthy();

    expect(
        isMatch({
          match: /ui/,
          request: {
            ...commonRequest,
            url: '/api/login',
          } as IsMatchParams['request'],
        }),
    ).toBeFalsy();
  });

  it('function to custom logic', () => {
    expect(
        isMatch({
          match: () => true,
          request: {
            ...commonRequest,
            url: '/api/login',
            method: 'POST',
          } as IsMatchParams['request'],
        }),
    ).toBeTruthy();

    expect(
        isMatch({
          match: () => false,
          request: {
            ...commonRequest,
            url: '/api/login',
            method: 'POST',
          } as IsMatchParams['request'],
        }),
    ).toBeFalsy();
  });
});
