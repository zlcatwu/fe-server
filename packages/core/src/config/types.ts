import {FastifyLoggerOptions} from 'fastify';
import {ServerOptions} from 'https';
import {Plugin} from '../plugin';

export type FeServerConfig = {
  port: number;
  https?: ServerOptions;
  plugins?: Plugin[];
  logger?: boolean | FastifyLoggerOptions;
};
