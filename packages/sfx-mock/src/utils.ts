import G, {glob} from 'glob';

export const parsePartialURL = (path: string) => new URL('http://0.0.0.0' + path);

export const globAsync = (pattern: string, options: G.IOptions) => new Promise<string[]>((resolve, reject) => {
  glob(pattern, options, (err, matches) => {
    if (err) {
      return reject(err);
    }
    resolve(matches);
  });
});

export const formatLog = (message: string) => `[fe-server-plugin-sfx-mock]: ${message}`;
