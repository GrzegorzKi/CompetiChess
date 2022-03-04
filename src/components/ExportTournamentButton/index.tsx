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

import { useAppSelector } from 'hooks';
import { selectTournament } from 'reducers/tournamentReducer';
import { downloadFile } from 'utils/fileUtils';

import { RootState, store } from '@/store';

function stripData(data: RootState) {
  if (data.tournament.players) {
    for (const [, player] of Object.entries(data.tournament.players.index)) {
      player.scores = [];
    }
  }
}

function exportTournament() {
  const tStore = clone(store.getState() as RootState);
  stripData(tStore);
  const tournamentJson = JSON.stringify(tStore.tournament);
  downloadFile(tournamentJson, `tournament-${tStore.tournament.tournament?.id}.json`, 'application/json');
}

const ExportTournamentButton: FunctionalComponent = () => {
  const tournament = useAppSelector(selectTournament);

  if (!tournament) {
    return null;
  }

  return <button class="button" onClick={() => exportTournament()}>
    Export
  </button>;
};

export default ExportTournamentButton;
