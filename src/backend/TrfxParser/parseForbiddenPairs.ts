import ParseResult, { isError } from '../types/ParseResult';

import { parseNumber } from './ParseUtils';

function parseForbiddenPairs(line: string): ParseResult<number[]> {
  const tokens = line.substr(4).split(/ \t/);
  const playerIds: number[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const parsedId = parseNumber(tokens[i]);
    if (isError(parsedId)) {
      return parsedId;
    }
    playerIds.push(parsedId);
  }

  return playerIds;
}

export default parseForbiddenPairs;
