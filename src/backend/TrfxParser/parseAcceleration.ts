import ParseResult, { ErrorCode, isError } from '../types/ParseResult';
import TrfFileFormat from '../types/TrfFileFormat';

import { createDefaultTrfPlayer } from './parseTrfPlayer';
import { hasTrailingChars, parseFloat, parsePlayerId } from './ParseUtils';

function parseAcceleration(line: string, trfxData: TrfFileFormat): ParseResult<null> {
  const regexp = /^.{4}(?<startingRank>[ \d]{4}) (?<acc>(?: [ \d]\d[.,]\d})*)\s*$/;
  const match = regexp.exec(line);

  if (match === null || match.groups === undefined) {
    return { error: ErrorCode.INVALID_LINE };
  }

  const { startingRank, acc } = match.groups;

  const playerId = parsePlayerId(startingRank.trimLeft());
  if (isError(playerId)) {
    return playerId;
  }

  if (trfxData.players[playerId] === undefined) {
    // eslint-disable-next-line no-param-reassign
    trfxData.players[playerId] = createDefaultTrfPlayer();
  }

  let i = 0;
  for (; i <= acc.length; i += 5) {
    const parsedPoints = parseFloat(acc.substring(i, i + 5).trimLeft());
    if (isError(parsedPoints)) {
      return parsedPoints;
    }
    trfxData.players[playerId].accelerations.push(parsedPoints);
  }

  if (hasTrailingChars(acc, i)) {
    return { error: ErrorCode.INVALID_LINE };
  }

  return null;
}

export default parseAcceleration;
