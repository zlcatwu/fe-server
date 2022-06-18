import {FastifyInstance} from 'fastify';
import * as plugin from '.';

describe('init', () => {
  it('plugin.init should be called in order', async () => {
    const execResult: unknown[] = [];
    const plugins: plugin.Plugin[] = [
      {
        name: 'plugin-1',
        init: () => new Promise<void>((resolve) => setTimeout(() => {
          execResult.push('plugin-1');
          resolve();
        }, 16)),
        config: {
          enable: true,
        },
      },
      {
        name: 'plugin-2',
        init: () => {
          execResult.push('plugin-2');
        },
        config: {
          enable: true,
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
    const execResult: unknown[] = [];
    const plugins: plugin.Plugin[] = [
      {
        name: 'plugin-1',
        handler: ({next}) => new Promise((resolve) => setTimeout(() => {
          execResult.push('plugin-1-1');
          resolve();
          next();
          execResult.push('plugin-1-2');
        })),
        config: {
          enable: true,
        },
      },
      {
        name: 'plugin-2',
        handler: async ({next}) => {
          execResult.push('plugin-2');
          await next();
        },
        config: {
          enable: true,
        },
      },
    ];
    const composed = plugin.composeHandler({
      plugins,
      storage: {} as plugin.PluginStorage,
      initResult: new Map(),
    });
    await composed({} as plugin.PluginHandlerFnParams);
    expect(execResult).toEqual(['plugin-1-1', 'plugin-2', 'plugin-1-2']);
  });

  it('ctx should exists', async () => {
    let outerCtx: plugin.PluginHandlerFnCtx | null = null;
    const plugins: plugin.Plugin[] = [
      {
        name: 'plugin-1',
        handler: async ({ctx}) => {
          outerCtx = ctx;
        },
        config: {
          enable: true,
        },
      },
    ];
    const composed = plugin.composeHandler({
      plugins,
      storage: {} as plugin.PluginStorage,
      initResult: new Map(),
    });
    await composed({} as plugin.PluginHandlerFnParams);
    expect((outerCtx as any)?.getData).toBeDefined();
  });
});

describe('createPluginStorage', () => {
  let storage: plugin.PluginStorage;
  const storeID = 'storeID';
  const data = 'value';

  beforeEach(() => {
    storage = plugin.createPluginStorage();
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

describe('preHandle', () => {
  it('should merge default config', () => {
    expect(plugin.preHandle({
      name: 'plugin',
      config: {
        field: 'value',
      },
    }).config).toEqual({
      ...plugin.DEFAULT_CONFIG,
      field: 'value',
    });
  });

  it('should override default config', () => {
    expect(plugin.preHandle({
      name: 'plugin',
      config: {
        enable: false,
      },
    }).config).toEqual({
      enable: false,
    });
  });
});
