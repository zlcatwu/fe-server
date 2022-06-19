import {IsMatchParams, MockMatchFn} from './types';
import {formatLog, parsePartialURL} from './utils';

const matchFnMap = {
  String: ({match, request}: IsMatchParams) => {
    return request.url.startsWith(match as string);
  },
  RegExp: ({match, request}: IsMatchParams) => {
    return (match as RegExp).test(request.url);
  },
  Function: ({match, request}: IsMatchParams) => {
    const url = parsePartialURL(request.url);
    return (match as MockMatchFn)({
      pathname: url.pathname,
      search: url.search,
      headers: request.headers,
      method: request.method,
    });
  },
};

export const isMatch = ({match, request}: IsMatchParams) => {
  const matchType = match.constructor.name;
  const result = matchFnMap[matchType]?.({match, request});
  if (result) {
    request.log.debug(formatLog(`${request.url} matched`));
  }
  return result;
};
