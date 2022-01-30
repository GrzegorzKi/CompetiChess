/*
 * Copyright (c) 2021-2022  Grzegorz Kita
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
import { Color, GameResult, TrfGame } from '../types/TrfFileFormat';
import { parsePlayerId } from '../utils/ParseUtils';
import {
  isValidColor, isValidResult, validateGameEntry
} from '../utils/TrfUtils';

export function defaultTrfGame(round: number): TrfGame {
  return {
    opponent: undefined,
    color: Color.NONE,
    result: GameResult.ZERO_POINT_BYE,
    round,
  };
}

export function parseTrfGame(
  roundLine: string,
  round: number,
  playerId: number
): ParseResult<TrfGame> {
  const trfGame = defaultTrfGame(round);

  const opponentString = roundLine.substring(2, 6);
  if (opponentString !== '    ' && opponentString !== '0000') {
    const opponent = parsePlayerId(opponentString.trimLeft());
    if (isError(opponent)) {
      return opponent;
    }
    if (opponent === playerId) {
      return { error: ErrorCode.INVALID_LINE };
    }
    trfGame.opponent = opponent;
  }

  const color = roundLine.substring(7, 8).toLowerCase();
  if (color === ' ') {
    trfGame.color = Color.NONE;
  } else if (isValidColor(color)) {
    trfGame.color = color;
  } else {
    return { error: ErrorCode.INVALID_VALUE, value: color };
  }

  const result = roundLine.substring(9, 10).toUpperCase();
  if (result === ' ') {
    trfGame.result = GameResult.ZERO_POINT_BYE;
  } else if (isValidResult(result)) {
    trfGame.result = result;
  } else {
    return { error: ErrorCode.INVALID_VALUE, value: result };
  }

  validateGameEntry(trfGame);

  return trfGame;
}

export default function parseTrfGames(gamesString: string, playerId: number)
    : ParseResult<TrfGame[]> {
  const games: TrfGame[] = [];
  let roundNum = 1;
  let skippedRounds = 0;

  let i = 0;
  for (; i <= gamesString.length; i += 10, roundNum += 1) {
    const gameLine = gamesString.substring(i, i + 10);
    if (gameLine.trimLeft() === '') {
      skippedRounds += 1;
    } else {
      // Append missing games as we've got a valid game line
      for (; skippedRounds > 0; skippedRounds--) {
        const unplayedRound = defaultTrfGame(roundNum - skippedRounds);
        games.push(unplayedRound);
      }
      // Parse game line
      const parsedGame = parseTrfGame(gameLine, roundNum, playerId);
      if (isError(parsedGame)) {
        return parsedGame;
      }
      games.push(parsedGame);
    }
  }

  return games;
}
