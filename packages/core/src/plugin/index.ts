import type {
  InitParams, ComposeHandlerParams, PluginHandlerFnParams, Plugin,
} from './types';

export * from './types';

export const init: (params: InitParams) => Promise<Map<Plugin, unknown>> = (params: InitParams) => {
  const initResult: Map<Plugin, unknown> = new Map();
  const toInit = params.plugins
      .filter(
          (plugin) => plugin.config.enable && plugin.init,
      );
  return toInit
      .reduce((pro, plugin) => {
        const wrappedInit = () => {
          const pros = Promise.resolve(plugin.init({
            fastify: params.fastify,
            storage: params.storage,
            config: plugin.config,
          }));
          pros.then((result) => {
            initResult.set(plugin, result);
          });
          return pros;
        };
        return pro.then(wrappedInit);
      }, Promise.resolve())
      .then(() => initResult);
};

export const composeHandler = (composeParams: ComposeHandlerParams) => {
  const toChain = composeParams.plugins.filter(
      (plugin) => plugin.config.enable && plugin.handler,
  );
  return (params: PluginHandlerFnParams) => {
    const ctx = createPluginStorage();
    const next = toChain.reduceRight<() => Promise<void> | void>((pre, cur) => {
      return () => cur.handler({
        ...params,
        config: cur.config,
        next: pre,
        ctx,
        initResult: composeParams.initResult.get(cur),
      });
    }, () => Promise.resolve());
    return next();
  };
};

export const createPluginStorage = () => {
  const store = new Map<string | number | symbol, unknown>();
  return {
    setData: (storeID: string, data: unknown) => store.set(storeID, data),
    getData: (storeID: string) => store.get(storeID) ?? null,
    removeData: (storeID: string) => store.delete(storeID),
  };
};

export const DEFAULT_CONFIG = {
  enable: true,
};
export const preHandle = (plugin: Plugin) => ({
  ...plugin,
  config: {
    ...DEFAULT_CONFIG,
    ...(plugin.config ?? {}),
  },
});
