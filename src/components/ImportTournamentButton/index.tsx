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

import { FunctionalComponent, h } from 'preact';
import { toast } from 'react-toastify';

import { PlayersState, loadNewFromJson, TournamentState } from 'reducers/tournamentReducer';
import { loadFile } from 'utils/fileUtils';
import { convertStringArrayToNumberArray, convertStringRecordToNumberRecord } from 'utils/typeUtils';

import { isTournamentStateJsonValid } from './index.guard';

import { Player } from '#/types/Tournament';
import { recalculatePlayerScores } from '#/utils/TournamentUtils';
import FileSelector from '@/FileSelector';
import { store } from '@/store';

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

  recalculatePlayerScores(data.players.index, data.configuration);
  return data;
}

function importTournament(fileList: FileList) {
  loadFile(fileList[0])
    .then((json) => {
      const parsedData = JSON.parse(json);
      const data = validateAndHydrateData(parsedData);
      store.dispatch(loadNewFromJson(data));
      const successText = <>Tournament <strong>{data.tournament.tournamentName}</strong> loaded successfully!</>;
      toast.success(successText);
    })
    .catch(() => {
      toast.error('Provided invalid file or file content is not a JSON object');
    });
}

const ImportTournamentButton: FunctionalComponent = () => {
  return (
    <FileSelector fileHandler={importTournament} className="button">
      Import from JSON
    </FileSelector>
  );
};

export default ImportTournamentButton;
