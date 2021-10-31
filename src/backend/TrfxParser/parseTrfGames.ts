import ParseResult, { ErrorCode, isError } from '../types/ParseResult';
import { Color, GameResult, TrfGame } from '../types/TrfFileFormat';

import { hasTrailingChars, parsePlayerId } from './ParseUtils';
import {
  isValidColor, isValidResult, validateGameEntry
} from './TrfUtils';

export function defaultTrfGame(round: number, playerId: number): TrfGame {
  return {
    opponent: playerId,
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
  const trfGame = defaultTrfGame(round, playerId);

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

  validateGameEntry(trfGame, playerId);

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
        const unplayedRound = defaultTrfGame(roundNum - skippedRounds, playerId);
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
  if (hasTrailingChars(gamesString, i)) {
    return { error: ErrorCode.INVALID_LINE };
  }

  return games;
}
