/*
 * Copyright (c) 2022  Grzegorz Kita
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

import { isError } from '#/types/ParseResult';
import { Configuration, GameResult } from '#/types/Tournament';
import { parseFloatNumber, tokenize } from '#/utils/ParseUtils';
import { getPointsForResult } from '#/utils/TournamentUtils';

export type ResultType =
  | 'WHITE_WIN'
  | 'BLACK_WIN'
  | 'DRAW'
  | 'WHITE_FORFEIT_WIN'
  | 'BLACK_FORFEIT_WIN'
  | 'FORFEIT'
  | 'BLACK_HALF_POINT'
  | 'WHITE_HALF_POINT'
  | 'ZERO_ZERO'

export type ComputedResults = { w: GameResult, b: GameResult };

const resultTypeToResult: Record<ResultType, ComputedResults> = {
  ZERO_ZERO: {
    w: GameResult.LOSS,
    b: GameResult.LOSS
  },
  BLACK_FORFEIT_WIN: {
    w: GameResult.FORFEIT_LOSS,
    b: GameResult.FORFEIT_WIN
  },
  BLACK_HALF_POINT: {
    w: GameResult.LOSS,
    b: GameResult.DRAW
  },
  BLACK_WIN: {
    w: GameResult.LOSS,
    b: GameResult.WIN
  },
  DRAW: {
    w: GameResult.DRAW,
    b: GameResult.DRAW
  },
  FORFEIT: {
    w: GameResult.FORFEIT_LOSS,
    b: GameResult.FORFEIT_LOSS
  },
  WHITE_FORFEIT_WIN: {
    w: GameResult.FORFEIT_WIN,
    b: GameResult.FORFEIT_LOSS
  },
  WHITE_HALF_POINT: {
    w: GameResult.DRAW,
    b: GameResult.LOSS
  },
  WHITE_WIN: {
    w: GameResult.WIN,
    b: GameResult.LOSS
  }
};

function parseResultSingle(resultString: string | undefined, configuration: Configuration): '+' | '-' | number | undefined {
  if (!resultString) {
    return undefined;
  }

  resultString = resultString.trim();
  const firstChar = resultString.substring(0, 1);
  if (firstChar === '+' || firstChar === '-') {
    return firstChar;
  }
  if (['='].includes(firstChar)) {
    return configuration.pointsForDraw;
  }

  const result = parseFloatNumber(resultString.replace(',', '.'));
  if (isError(result)) {
    return undefined;
  }
  if (result % 1 === 0) {
    if (resultString.at(result.toString().length) === '=') {
      return (result + 0.5);
    }
  } else if (result % 0.5 === 0) {
    return result;
  }

  return Math.floor(result);
}

function getWhiteGameResult(result: number, configuration: Configuration): GameResult {
  const values = [
    { type: GameResult.WIN, value: configuration.pointsForWin },
    { type: GameResult.DRAW, value: configuration.pointsForDraw },
    { type: GameResult.LOSS, value: configuration.pointsForLoss },
  ];
  values.sort((a, b) => b.value - a.value);

  if (result >= values[0].value) {
    return values[0].type;
  }
  if (result >= values[1].value) {
    return values[1].type;
  }
  return values[2].type;
}

function getBlackGameResult(result: '+' | '-' | number | undefined, configuration: Configuration): GameResult {
  if (result === '+') {
    // Return maximum points - here just 'WIN'
    return GameResult.WIN;
  }
  if (result === '-' || result === undefined) {
    // Return zero points
    return GameResult.LOSS;
  }

  return getWhiteGameResult(result, configuration);
}

const isValidResult = (white: GameResult, black: GameResult, configuration: Configuration): boolean => {
  const winPoints = configuration.pointsForWin + configuration.pointsForLoss;
  const drawPoints = configuration.pointsForDraw * 2;
  const drawAndLossPoints = configuration.pointsForDraw + configuration.pointsForLoss;
  const notPlayedPoints = configuration.pointsForLoss * 2;
  const pointsCombinations = [winPoints, drawPoints, drawAndLossPoints, notPlayedPoints];

  const whitePoints = getPointsForResult(white, configuration);
  const blackPoints = getPointsForResult(black, configuration);

  return pointsCombinations.includes(whitePoints + blackPoints);
};

export const parseResultString = (resultString: string, configuration: Configuration): ComputedResults => {
  const [white, black] = tokenize(resultString, ':');
  const whiteResult = parseResultSingle(white, configuration);
  const blackResult = parseResultSingle(black, configuration);

  if (whiteResult === undefined) {
    return { w: GameResult.UNASSIGNED, b: GameResult.UNASSIGNED };
  }
  if (whiteResult === '+') {
    return { w: GameResult.FORFEIT_WIN, b: GameResult.FORFEIT_LOSS };
  }
  if (whiteResult === '-') {
    if (blackResult === '-') {
      return { w: GameResult.FORFEIT_LOSS, b: GameResult.FORFEIT_LOSS };
    }
    return { w: GameResult.FORFEIT_LOSS, b: GameResult.FORFEIT_WIN };
  }

  const whiteGameResult = getWhiteGameResult(whiteResult, configuration);
  const blackGameResult = getBlackGameResult(blackResult, configuration);

  if (!isValidResult(whiteGameResult, blackGameResult, configuration)) {
    return { w: GameResult.UNASSIGNED, b: GameResult.UNASSIGNED };
  }

  return { w: whiteGameResult, b: blackGameResult };
};

export const computeResult = (type: ResultType): ComputedResults => {
  return resultTypeToResult[type];
};
