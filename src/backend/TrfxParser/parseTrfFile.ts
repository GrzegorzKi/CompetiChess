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

import i18n from 'i18n/config';

import { fieldParser, ParseData } from './parseValues';

import { ErrorCode, getDetails, isError, ParseError } from '#/types/ParseResult';
import {
  Color,
  Configuration,
  Field,
  Pair,
  PlayersRecord,
  Tournament,
} from '#/types/Tournament';
import WarnCode from '#/types/WarnCode';
import { assignByesAndLates, evenUpGamesHistory } from '#/utils/GamesUtils';
import {
  calculatePlayedRounds,
  checkAndAssignAccelerations,
  createDefaultConfiguration,
  createDefaultTournamentData,
  detectHolesInIds,
  generatePairs,
  getPlayers,
  inferInitialColor,
  recalculatePlayerScores,
  recalculatePositionalRanks,
  validatePairConsistency,
} from '#/utils/TournamentUtils';

export type ValidTrfData = {
  tournament: Tournament,
  configuration: Configuration,
  players: PlayersRecord,
  playersById: number[],
  playersByPosition: number[],
  pairs: Array<Pair[]>,
  warnings: WarnCode[],
};
export type ParsingErrors = { parsingErrors: string[] };

export type ParseTrfFileResult =
  | ValidTrfData
  | ParsingErrors;

function postProcessData({
  tournament,
  players,
  playersByPosition,
  configuration,
  accelerations,
  forbiddenPairs,
  byes
}: ParseData): ParseTrfFileResult {
  const warnings: WarnCode[] = [];
  const playersById = Object.entries(players).map(([, player]) => player.id).sort((a, b) => a - b);

  const resultAcc = checkAndAssignAccelerations(players,
    accelerations, configuration.expectedRounds);

  if (isError(resultAcc)) {
    return { parsingErrors: [getDetails(resultAcc)] };
  }

  const playedRounds = calculatePlayedRounds(players);
  if (configuration.expectedRounds <= 0
    || playedRounds > configuration.expectedRounds) {
    configuration.expectedRounds = playedRounds;
    warnings.push(WarnCode.ROUND_NUM);
  }

  // Push forbidden pairs for the next round
  tournament.forbiddenPairs.push({
    round: playedRounds + 1,
    pairs: forbiddenPairs,
  });

  const playersArray = getPlayers(players, playersById, playersByPosition, configuration.matchByRank);

  // Infer initial color if not set
  if (configuration.initialColor === Color.NONE) {
    const color = inferInitialColor(
      playersArray,
      playedRounds
    );
    if (color === Color.NONE) {
      warnings.push(WarnCode.INITIAL_COLOR);
    } else {
      configuration.initialColor = color;
    }
  }

  const pairResult = validatePairConsistency(players);
  if (isError(pairResult)) {
    return { parsingErrors: [getDetails(pairResult)] };
  }

  recalculatePositionalRanks(playersArray);
  if (detectHolesInIds(players)) {
    warnings.push(WarnCode.HOLES_IN_IDS);
  }

  assignByesAndLates(players, playedRounds, byes);
  const pairs = generatePairs(players, playedRounds);
  evenUpGamesHistory(players, playedRounds);
  recalculatePlayerScores(players, configuration);

  return {
    tournament,
    configuration,
    players,
    playersById,
    playersByPosition,
    pairs,
    warnings,
  };
}

export default function parseTrfFile(content: string): ParseTrfFileResult {
  const data: ParseData = {
    tournament: createDefaultTournamentData(),
    players: {},
    playersByPosition: [],
    configuration: createDefaultConfiguration(),
    accelerations: [],
    byes: [],
    forbiddenPairs: []
  };

  const parsingErrors: string[] = [];

  const parseLine = (line: string, lineNum: number) => {
    const errorCallback = (e: ParseError) => {
      parsingErrors.push(i18n.t('Error on line', { num: lineNum + 1, details: getDetails(e) }));
    };

    if (line.length >= 4 && line.at(3) !== ' ') {
      errorCallback({ error: ErrorCode.INVALID_LINE });
    }

    const prefix = line.substring(0, 3);
    const value = line.substring(4).trimEnd();

    const parseField = fieldParser[prefix as Field];

    if (parseField !== undefined) {
      const result = parseField(data, value);
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
        parsingErrors.push(i18n.t('Processing stopped error'));
        break;
      }
    }
  }

  if (parsingErrors.length !== 0) {
    return { parsingErrors };
  }

  return postProcessData(data);
}

export function isTournamentValid(data?: ParseTrfFileResult): data is ValidTrfData {
  return data !== undefined && !('parsingErrors' in data);
}
