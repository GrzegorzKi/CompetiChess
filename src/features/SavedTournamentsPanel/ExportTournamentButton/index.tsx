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

import clone from 'just-clone';
import { FunctionalComponent, h } from 'preact';
import { useTranslation } from 'react-i18next';

import { TournamentState } from 'reducers/tournamentReducer';
import { downloadFile } from 'utils/fileUtils';
import {
  readFromLocalStorage,
  tournamentKeyPrefix,
} from 'utils/localStorageUtils';

import { RootState, store } from '@/store';

function stripData(tournament: TournamentState) {
  if (tournament.players) {
    for (const [, player] of Object.entries(tournament.players.index)) {
      player.scores = [];
    }
  }
}

function exportTournament(id: string) {
  const storeState = store.getState() as RootState;
  let tournamentState: TournamentState;
  if (storeState.tournament.tournament?.id === id) {
    tournamentState = clone(storeState.tournament);
  } else {
    const readState = readFromLocalStorage<TournamentState>(tournamentKeyPrefix + id);
    if (!readState) {
      return;
    }
    tournamentState = readState;
  }

  stripData(tournamentState);
  const json = JSON.stringify(tournamentState);

  downloadFile(json, `tournament-${id}.json`, 'application/json');
}

interface Props {
  id: string;
}

const ExportTournamentButton: FunctionalComponent<Props> = ({ id }) => {
  const { t } = useTranslation();
  
  return <button class="button" onClick={() => exportTournament(id)}>
    {t('Export')}
  </button>;
};

export default ExportTournamentButton;
