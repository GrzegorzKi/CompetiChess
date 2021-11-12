/*
 * Copyright (c) 2021  Grzegorz Kita
 *
 * This file is part of CompetiChess.
 *
 * CompetiChess is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * CompetiChess is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CompetiChess.  If not, see <http://www.gnu.org/licenses/>.
 */

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
