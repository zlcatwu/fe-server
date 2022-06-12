import type {
  InitParams, ComposeHandlerParams, PluginHandlerFnParams,
} from './types';

export * from './types';

export const init = (params: InitParams) => {
  const toInit = params.plugins.filter(
      (plugin) => plugin.config.enable && plugin.init,
  );
  return toInit.reduce((pro, plugin) => {
    const wrappedInit = () => Promise.resolve(plugin.init({
      fastify: params.fastify,
      storage: params.storage,
      config: plugin.config,
    }));
    return pro.then(wrappedInit);
  }, Promise.resolve());
};

export const composeHandler = (composeParams: ComposeHandlerParams) => {
  const toChain = composeParams.plugins.filter(
      (plugin) => plugin.config.enable && plugin.handler,
  );
  return (params: PluginHandlerFnParams) => {
    const ctx = getPluginStorage();
    const next = toChain.reduceRight<() => Promise<void> | void>((pre, cur) => {
      return () => cur.handler({
        ...params,
        config: cur.config,
        next: pre,
        ctx,
      });
    }, () => Promise.resolve());
    return next();
  };
};

export const getPluginStorage = () => {
  const store = new Map<string | number | symbol, any>();
  return {
    setData: (storeID: string, data: any) => store.set(storeID, data),
    getData: (storeID: string) => store.get(storeID) ?? null,
    removeData: (storeID: string) => store.delete(storeID),
  };
};
