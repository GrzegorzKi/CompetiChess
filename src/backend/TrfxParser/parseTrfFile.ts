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

import { ErrorCode, getDetails, isError, ParseError } from '../types/ParseResult';
import TournamentData from '../types/TournamentData';
import { Color, Field } from '../types/TrfFileFormat';
import WarnCode from '../types/WarnCode';
import {
  assignByesAndLates,
  assignPairs,
  calculatePlayedRounds,
  evenUpMatchHistories,
} from '../utils/TrfUtils';

import { AdditionalData, fieldParser } from './parseValues';

export type ValidTrfData = { trfxData: TournamentData, warnings: WarnCode[] };
export type ParsingErrors = { parsingErrors: string[] };

export type ParseTrfFileResult =
  | ValidTrfData
  | ParsingErrors;

function postProcessData(
  tournamentData: TournamentData,
  { accelerations, forbiddenPairs, byes }: AdditionalData) {

  const warnings: WarnCode[] = [];

  const resultAcc = tournamentData.checkAndAssignAccelerations(accelerations);
  if (isError(resultAcc)) {
    return { parsingErrors: [getDetails(resultAcc)] };
  }

  const playedRounds = calculatePlayedRounds(tournamentData.players);
  tournamentData.playedRounds = playedRounds;
  if (tournamentData.expectedRounds <= 0
    || tournamentData.playedRounds > tournamentData.expectedRounds) {
    tournamentData.expectedRounds = playedRounds;
    warnings.push(WarnCode.ROUND_NUM);
  }

  // Push forbidden pairs for the next round
  tournamentData.forbiddenPairs.push({
    round: playedRounds + 1,
    pairs: forbiddenPairs,
  });

  // Infer initial color if not set
  if (tournamentData.configuration.initialColor === Color.NONE) {
    const color = tournamentData.inferInitialColor();
    if (color === Color.NONE) {
      warnings.push(WarnCode.INITIAL_COLOR);
    } else {
      tournamentData.configuration.initialColor = color;
    }
  }

  const pairResult = tournamentData.validatePairConsistency();
  if (isError(pairResult)) {
    return { parsingErrors: [getDetails(pairResult)] };
  }

  tournamentData.reorderAndAssignPositionalRanks();
  // TODO Detect holes in player ids - add warning then

  assignByesAndLates(tournamentData, byes);
  evenUpMatchHistories(tournamentData.players, playedRounds);
  assignPairs(tournamentData);

  tournamentData.recalculatePlayerScores();

  return {
    trfxData: tournamentData,
    warnings,
  };
}

export default function parseTrfFile(content: string): ParseTrfFileResult {
  const tournamentData = new TournamentData();
  const additionalData: AdditionalData = {
    accelerations: [],
    byes: [],
    forbiddenPairs: []
  };

  const parsingErrors: string[] = [];

  const parseLine = (line: string, lineNum: number) => {
    const errorCallback = (e: ParseError) => {
      parsingErrors.push(`Error on line ${lineNum + 1} - ${getDetails(e)}`);
    };

    if (line.length >= 4 && line.at(3) !== ' ') {
      errorCallback({ error: ErrorCode.INVALID_LINE });
    }

    const prefix = line.substring(0, 3);
    const value = line.substring(4).trimEnd();

    const parseFunc = fieldParser[prefix as Field];

    if (parseFunc !== undefined) {
      const result = parseFunc(tournamentData, value, additionalData);
      if (isError(result)) {
        errorCallback(result);
      }
    }
  };

  const stringArray = content.split(/[\r\n]+/);

  for (let i = 0; i < stringArray.length; ++i) {
    const line = stringArray[i];
    if (line.length >= 3) {
      parseLine(line, i);
      if (parsingErrors.length >= 20) {
        parsingErrors.push('Processing stopped due to multiple errors found');
        break;
      }
    }
  }

  if (parsingErrors.length !== 0) {
    return { parsingErrors };
  }

  return postProcessData(tournamentData, additionalData);
}
