import {FastifyLoggerOptions} from 'fastify';
import {ServerOptions} from 'https';
import {Plugin} from '../plugin';

export type FeServerConfig = {
  port?: number;
  host?: string;
  https?: ServerOptions;
  plugins?: Plugin[];
  logger?: boolean | FastifyLoggerOptions;
};
