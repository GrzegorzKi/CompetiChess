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

import { ErrorCode, isError, ParseError } from '../types/ParseResult';
import TournamentData from '../types/TournamentData';
import { Color, Field } from '../types/TrfFileFormat';
import { parseNumber, tokenize, tokenizeToNumbers } from '../utils/ParseUtils';

import parseAcceleration, { Acceleration } from './parseAcceleration';
import parseTrfPlayer from './parseTrfPlayer';

export type ParseFunc = (tournament: TournamentData, value: string, additionalData: AdditionalData) => ParseError | void;

export interface AdditionalData {
  accelerations: Array<Acceleration>;
  forbiddenPairs: Array<number[]>;
  byes: Array<number>;
}

export const fieldParser: Record<Field, ParseFunc> = {
  [Field.TOURNAMENT_NAME]: (t, value) => { t.tournamentName = value; },
  [Field.CITY]: (t, value) => { t.city = value; },
  [Field.FEDERATION]: (t, value) => { t.federation = value; },
  [Field.START_DATE]: (t, value) => { t.dateOfStart = value; },
  [Field.END_DATE]: (t, value) => { t.dateOfEnd = value; },
  [Field.NUM_PLAYERS]: (t, value) => {
    const tryNumPlayers = parseNumber(value);
    if (isError(tryNumPlayers)) {
      return tryNumPlayers;
    }
    t.numberOfPlayers = tryNumPlayers;
  },
  [Field.NUM_RATED_PLAYERS]: (t, value) => {
    const tryNumRatedPlayers = parseNumber(value);
    if (isError(tryNumRatedPlayers)) {
      return tryNumRatedPlayers;
    }
    t.numberOfRatedPlayers = tryNumRatedPlayers;
  },
  [Field.NUM_TEAMS]: (t, value) => {
    const tryNumTeams = parseNumber(value);
    if (isError(tryNumTeams)) {
      return tryNumTeams;
    }
    t.numberOfTeams = tryNumTeams;
  },
  [Field.TYPE]: (t, value) => { t.tournamentType = value; },
  [Field.CHIEF_ARBITER]: (t, value) => { t.chiefArbiter = value; },
  [Field.DEPUTY_ARBITER]: (t, value) => { t.deputyArbiters.push(value); },
  [Field.RATE_OF_PLAY]: (t, value) => { t.rateOfPlay = value; },
  [Field.ROUND_DATES]: () => { /* TODO Pass - no idea how to parse it with current specification */ },
  [Field.PLAYER_ENTRY]: (t, value) => {
    const tryTrfPlayer = parseTrfPlayer(value);
    if (isError(tryTrfPlayer)) {
      return tryTrfPlayer;
    } else if (t.players[tryTrfPlayer.playerId] !== undefined) {
      return { error: ErrorCode.PLAYER_DUPLICATE, playerId: tryTrfPlayer.playerId };
    }
    t.players[tryTrfPlayer.playerId] = tryTrfPlayer;
    t.playersByPosition.push(tryTrfPlayer);
  },
  [Field.TEAM_ENTRY]: () => { /* TODO Implement in the future */ },

  [Field.ACCELERATION]: (t, value, data) => {
    const result = parseAcceleration(value);
    if (isError(result)) {
      return result;
    }
    data.accelerations.push(result);
  },
  [Field.FORBIDDEN_PAIRS]: (t, value, data) => {
    const result = tokenizeToNumbers(value);
    if (isError(result)) {
      return result;
    }
    if (result.length !== 0) {
      data.forbiddenPairs.push(result);
    }
  },
  [Field.NUM_ROUNDS]: (t, value) => {
    const tryNumRounds = parseNumber(value);
    if (isError(tryNumRounds)) {
      return tryNumRounds;
    }
    t.expectedRounds = tryNumRounds;
  },
  [Field.CONFIG]: (t, value) => {
    const strings = tokenize(value);
    for (const string of strings) {
      if (string === 'rank') {
        t.configuration.matchByRank = true;
      } else if (string === 'white1') {
        t.configuration.initialColor = Color.WHITE;
      } else if (string === 'black1') {
        t.configuration.initialColor = Color.BLACK;
      }
    }
  },
  [Field.BYES]: (t, value, data) => {
    const result = tokenizeToNumbers(value);
    if (isError(result)) {
      return result;
    }
    if (result.length !== 0) {
      result.forEach((playerId) => data.byes.push(playerId - 1));
    }
  },
  [Field.POINTS_MODIFIER]: () => { /* TODO XX# points modifier parsing */ }
};
