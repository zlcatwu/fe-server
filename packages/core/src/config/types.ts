import {ServerOptions} from 'https';
import {Plugin} from '../plugin';

export type FeServerConfig = {
  port: number;
  https?: ServerOptions;
  plugins?: Plugin[];
};
