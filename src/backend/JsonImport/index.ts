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

import { PlayersState, TournamentState } from 'reducers/tournamentReducer';

import {
  convertStringArrayToNumberArray,
  convertStringRecordToNumberRecord,
} from 'utils/typeUtils';

import { isTournamentStateJsonValid } from './index.guard';

import { Player } from '#/types/Tournament';
import { getPlayers, recalculatePlayerScores } from '#/utils/TournamentUtils';

export interface PlayersStateJson extends Omit<PlayersState, 'index'> {
  index: Record<string, Player>,
}

/** @see {isTournamentStateJsonValid} ts-auto-guard:type-guard */
export interface TournamentStateJson extends Omit<Required<TournamentState>, 'players' | 'error'> {
  players: PlayersStateJson,
}

function normalizePlayersKeysToNumbers(data: any) {
  if (data['players']) {
    const players = data.players as Partial<PlayersState>;
    if (players.index && players.orderById && players.orderByPosition) {
      players.index = convertStringRecordToNumberRecord(players.index);
      players.orderById = convertStringArrayToNumberArray(players.orderById as unknown as string[]);
      players.orderByPosition = convertStringArrayToNumberArray(players.orderByPosition as unknown as string[]);
    }
    if (players.index && players.orderById && players.orderByPosition) {
      return true;
    }
  }
  return false;
}

function validateAndHydrateData(data: unknown): TournamentStateJson {
  if (!isTournamentStateJsonValid(data) || !normalizePlayersKeysToNumbers(data)) {
    throw new Error('File is invalid - please provide a valid JSON file');
  }

  // Then hydrate the data
  const { index, orderById, orderByPosition } = data.players;
  const playersArray = getPlayers(index, orderById, orderByPosition, data.configuration.matchByRank);

  recalculatePlayerScores(playersArray, data.configuration);
  return data;
}

export const importTournamentFromJson = (json: string): TournamentStateJson => {
  const parsedData = JSON.parse(json);
  return validateAndHydrateData(parsedData);
};
