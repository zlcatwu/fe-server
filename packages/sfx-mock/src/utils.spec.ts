import {parsePartialURL} from './utils';

describe('parsePartialURL', () => {
  it('pass url path should work', () => {
    const result = parsePartialURL('/api/login?user=root');
    expect(result.pathname).toBe('/api/login');
    expect(result.search).toBe('?user=root');
  });
});
