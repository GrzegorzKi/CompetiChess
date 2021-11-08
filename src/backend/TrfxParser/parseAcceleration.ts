import ParseResult, { ErrorCode, isError } from '../types/ParseResult';
import { parseFloat, parsePlayerId } from '../utils/ParseUtils';

export type Acceleration = {
  playerId: number,
  values: number[],
};

export default function parseAcceleration(line: string): ParseResult<Acceleration> {
  const values: number[] = [];

  const regexp = /^.{4}(?<startingRank>[ \d]{4})(?<acc>(?: [ \d]\d[.,]\d)*)\s*$/;
  const match = regexp.exec(line);

  if (match === null || match.groups === undefined) {
    return { error: ErrorCode.INVALID_LINE };
  }

  const { startingRank, acc } = match.groups;

  const playerId = parsePlayerId(startingRank.trimLeft());
  if (isError(playerId)) {
    return playerId;
  }

  let i = 0;
  for (; i <= acc.length; i += 5) {
    const parsedPoints = parseFloat(acc.substring(i, i + 5).trimLeft());
    if (isError(parsedPoints)) {
      return parsedPoints;
    }
    values.push(parsedPoints);
  }

  return {
    playerId,
    values
  };
}
