import ParseResult, { ErrorCode, isError } from '../types/ParseResult';
import {
  Color, GameResult, isValidColor, isValidResult, TrfGame
} from '../types/TrfxFileFormat';

import { tryParseNumber, validateIsInRange } from './ParseUtils';

const maxPlayers = 9999;

export function defaultTrfGame(round: number): TrfGame {
  return {
    opponent: NaN,
    color: Color.NONE,
    result: GameResult.ZERO_POINT_BYE,
    round,
  };
}

export function parseTrfGame(roundLine: string, round: number): ParseResult<TrfGame> {
  const trfGame = defaultTrfGame(round);

  const opponent = roundLine.substring(2, 6);
  if (opponent !== '    ' && opponent !== '0000') {
    const parsedOpponent = tryParseNumber(opponent.trimLeft());
    if (isError(parsedOpponent)) {
      return parsedOpponent;
    }
    const validatedOpponent = validateIsInRange(parsedOpponent, 1, maxPlayers);
    if (isError(validatedOpponent)) {
      return validatedOpponent;
    }
    trfGame.opponent = validatedOpponent;
  }

  const color = roundLine.substring(7, 8).toLowerCase();
  if (color === ' ') {
    trfGame.color = Color.NONE;
  } else if (isValidColor(color)) {
    trfGame.color = color;
  } else {
    return { error: ErrorCode.INVALID_VALUE, what: color };
  }

  const result = roundLine.substring(9, 10).toUpperCase();
  if (result === ' ') {
    trfGame.result = GameResult.ZERO_POINT_BYE;
  } else if (isValidResult(result)) {
    trfGame.result = result;
  } else {
    return { error: ErrorCode.INVALID_VALUE, what: result };
  }

  return trfGame;
}

export default function parseTrfGames(gamesString: string): ParseResult<Map<number, TrfGame>> {
  const games = new Map<number, TrfGame>();
  let roundNum = 1;
  let skippedRounds = 0;

  for (let i = 0; i <= gamesString.length; i += 10, roundNum += 1) {
    const gameLine = gamesString.substring(i, i + 10);
    if (gameLine.trimLeft() === '') {
      skippedRounds += 1;
    } else {
      // Append missing games as we've got a valid game line
      for (; skippedRounds > 0; skippedRounds--) {
        const unplayedRound = defaultTrfGame(roundNum - skippedRounds);
        games.set(unplayedRound.round, unplayedRound);
      }
      // Parse game line
      const parsedGame = parseTrfGame(gameLine, roundNum);
      if (isError(parsedGame)) {
        return parsedGame;
      }
      games.set(parsedGame.round, parsedGame);
    }
  }

  return games;
}
