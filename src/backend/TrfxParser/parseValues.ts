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

import parseAcceleration, { Acceleration } from './parseAcceleration';
import parseTrfPlayer from './parseTrfPlayer';

import { ErrorCode, isError, ParseError } from '#/types/ParseResult';
import Tournament, { Color, Configuration, Field, PlayersRecord } from '#/types/Tournament';
import { parseNumber, tokenize, tokenizeToNumbers } from '#/utils/ParseUtils';

export type ParseFunc = (data: ParseData, value: string) => ParseError | void;

export interface ParseData {
  tournament: Tournament,
  players: PlayersRecord,
  playersByPosition: number[],
  configuration: Configuration,
  accelerations: Acceleration[],
  forbiddenPairs: Array<number[]>,
  byes: Array<number>,
}

export const fieldParser: Record<Field, ParseFunc> = {
  [Field.TOURNAMENT_NAME]: ({ tournament: t }, value) => { t.tournamentName = value; },
  [Field.CITY]: ({ tournament: t }, value) => { t.city = value; },
  [Field.FEDERATION]: ({ tournament: t }, value) => { t.federation = value; },
  [Field.START_DATE]: ({ tournament: t }, value) => { t.dateOfStart = value; },
  [Field.END_DATE]: ({ tournament: t }, value) => { t.dateOfEnd = value; },
  [Field.NUM_PLAYERS]: ({ tournament: t }, value) => {
    const tryNumPlayers = parseNumber(value);
    if (isError(tryNumPlayers)) {
      return tryNumPlayers;
    }
    t.numberOfPlayers = tryNumPlayers;
  },
  [Field.NUM_RATED_PLAYERS]: ({ tournament: t }, value) => {
    const tryNumRatedPlayers = parseNumber(value);
    if (isError(tryNumRatedPlayers)) {
      return tryNumRatedPlayers;
    }
    t.numberOfRatedPlayers = tryNumRatedPlayers;
  },
  [Field.NUM_TEAMS]: ({ tournament: t }, value) => {
    const tryNumTeams = parseNumber(value);
    if (isError(tryNumTeams)) {
      return tryNumTeams;
    }
    t.numberOfTeams = tryNumTeams;
  },
  [Field.TYPE]: ({ tournament: t }, value) => { t.tournamentType = value; },
  [Field.CHIEF_ARBITER]: ({ tournament: t }, value) => { t.chiefArbiter = value; },
  [Field.DEPUTY_ARBITER]: ({ tournament: t }, value) => { t.deputyArbiters.push(value); },
  [Field.RATE_OF_PLAY]: ({ tournament: t }, value) => { t.rateOfPlay = value; },
  [Field.ROUND_DATES]: () => { /* TODO Pass - no idea how to parse it with current specification */ },
  [Field.PLAYER_ENTRY]: ({ players, playersByPosition }, value) => {
    const tryTrfPlayer = parseTrfPlayer(value);
    if (isError(tryTrfPlayer)) {
      return tryTrfPlayer;
    } else if (players[tryTrfPlayer.id] !== undefined) {
      return { error: ErrorCode.PLAYER_DUPLICATE, id: tryTrfPlayer.id };
    }
    players[tryTrfPlayer.id] = tryTrfPlayer;
    playersByPosition.push(tryTrfPlayer.id);
  },
  [Field.TEAM_ENTRY]: () => { /* TODO Implement in the future */ },

  [Field.ACCELERATION]: ({ accelerations }, value) => {
    const result = parseAcceleration(value);
    if (isError(result)) {
      return result;
    }
    accelerations.push(result);
  },
  [Field.FORBIDDEN_PAIRS]: ({ forbiddenPairs }, value) => {
    const result = tokenizeToNumbers(value);
    if (isError(result)) {
      return result;
    }
    if (result.length !== 0) {
      forbiddenPairs.push(result);
    }
  },
  [Field.NUM_ROUNDS]: ({ configuration }, value) => {
    const tryNumRounds = parseNumber(value);
    if (isError(tryNumRounds)) {
      return tryNumRounds;
    }
    configuration.expectedRounds = tryNumRounds;
  },
  [Field.CONFIG]: ({ configuration }, value) => {
    const strings = tokenize(value);
    for (const string of strings) {
      if (string === 'rank') {
        configuration.matchByRank = true;
      } else if (string === 'white1') {
        configuration.initialColor = Color.WHITE;
      } else if (string === 'black1') {
        configuration.initialColor = Color.BLACK;
      }
    }
  },
  [Field.BYES]: ({ byes }, value) => {
    const result = tokenizeToNumbers(value);
    if (isError(result)) {
      return result;
    }
    if (result.length !== 0) {
      result.forEach((playerId) => byes.push(playerId - 1));
    }
  },
  [Field.POINTS_MODIFIER]: () => { /* TODO XX# points modifier parsing */ }
};
