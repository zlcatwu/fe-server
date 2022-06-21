import {mergeConfig} from '.';

const mockPort = 8080;
jest.mock('get-port', () => ({
  __esModule: true,
  default: jest.fn(() => mockPort),
}));

describe('mergeConfig', () => {
  it('should provide random port when missing port', async () => {
    const port = 80;

    expect((await mergeConfig({port})).port).toBe(port);
    expect((await mergeConfig({})).port).toBe(mockPort);
  });

  it('should provide 0.0.0.0 as default host', async () => {
    const host = '127.0.0.1';

    expect((await mergeConfig({host})).host).toBe(host);
    expect((await mergeConfig({})).host).toBe('0.0.0.0');
  });
});
