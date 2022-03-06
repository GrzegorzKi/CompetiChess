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

import { useAppSelector } from 'hooks/index';
import { clearIsModified, selectTournament } from 'reducers/tournamentReducer';

import { saveTournamentToLocalStorage } from 'utils/localStorageUtils';

import { RootState, store } from '@/store';

function saveTournament() {
  try {
    const storeState = store.getState() as RootState;

    const saved = saveTournamentToLocalStorage(storeState.tournament);
    store.dispatch(clearIsModified());
    if (saved) {
      toast.success('Tournament saved!');
    } else {
      toast.warning('Nothing to save: There is no tournament active.');
    }

  } catch (e) {
    toast.error('Unable to save tournament');
  }
}

const SaveTournamentButton: FunctionalComponent = () => {
  const tournament = useAppSelector(selectTournament);

  return <button disabled={!tournament} class="button" onClick={() => saveTournament()}>
    Save
  </button>;
};

export default SaveTournamentButton;