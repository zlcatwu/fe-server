import {FastifyInstance} from 'fastify';
import * as plugin from '.';

describe('init', () => {
  it('plugin.init should be called in order', async () => {
    const execResult = [];
    const plugins: plugin.Plugin[] = [
      {
        name: 'plugin-1',
        init: () => new Promise((resolve) => setTimeout(() => {
          execResult.push('plugin-1');
          resolve();
        }, 16)),
      },
      {
        name: 'plugin-2',
        init: () => {
          execResult.push('plugin-2');
        },
      },
    ];
    await plugin.init({
      fastify: {} as FastifyInstance,
      plugins,
      storage: {} as plugin.PluginStorage,
    });
    expect(execResult).toEqual(['plugin-1', 'plugin-2']);
  });
});


describe('composeHandler', () => {
  it('plugin.handler should be called in order', async () => {
    const execResult = [];
    const plugins: plugin.Plugin[] = [
      {
        name: 'plugin-1',
        handler: ({next}) => new Promise((resolve) => setTimeout(() => {
          execResult.push('plugin-1-1');
          resolve();
          next();
          execResult.push('plugin-1-2');
        })),
      },
      {
        name: 'plugin-2',
        handler: async ({next}) => {
          execResult.push('plugin-2');
          await next();
        },
      },
    ];
    const composed = plugin.composeHandler({
      plugins,
      storage: {} as plugin.PluginStorage,
    });
    await composed({} as plugin.PluginHandlerFnParams);
    expect(execResult).toEqual(['plugin-1-1', 'plugin-2', 'plugin-1-2']);
  });

  it('ctx should exists', async () => {
    let outerCtx: plugin.PluginHandlerFnCtx;
    const plugins: plugin.Plugin[] = [
      {
        name: 'plugin-1',
        handler: async ({ctx}) => {
          outerCtx = ctx;
        },
      },
    ];
    const composed = plugin.composeHandler({
      plugins,
      storage: {} as plugin.PluginStorage,
    });
    await composed({} as plugin.PluginHandlerFnParams);
    expect(outerCtx.getData).toBeDefined();
  });
});

describe('getPluginStorage', () => {
  let storage: plugin.PluginStorage;
  const storeID = 'storeID';
  const data = 'value';

  beforeEach(() => {
    storage = plugin.getPluginStorage();
  });

  it('getData should return the value that setData store', () => {
    expect(storage.getData(storeID)).toBe(null);
    storage.setData(storeID, data);
    expect(storage.getData(storeID)).toBe(data);
  });

  it('removeData should work', () => {
    storage.setData(storeID, data);
    storage.removeData(storeID);
    expect(storage.getData(storeID)).toBe(null);
  });
});
