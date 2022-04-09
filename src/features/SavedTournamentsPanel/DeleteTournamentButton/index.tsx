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

import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { FunctionalComponent, h } from 'preact';
import { toast } from 'react-toastify';

import { close } from 'reducers/tournamentReducer';
import { removeTournamentFromLocalStorage } from 'utils/localStorageUtils';

import { store } from '@/store';
import TransText from '@/TransText';

async function deleteTournament(id: string, onDeleteGuard?: () => Promise<unknown>) {
  if (onDeleteGuard && !await onDeleteGuard()) return;

  removeTournamentFromLocalStorage(id);
  const state = store.getState();
  if (state.tournament.tournament?.id === id) {
    store.dispatch(close());
  }

  toast.info(<TransText i18nKey='Tournament deleted' />);
}

interface Props {
  id: string;
  onDeleteGuard?: () => Promise<boolean>;
}

const DeleteTournamentButton: FunctionalComponent<Props> = ({ id, onDeleteGuard }) => {
  return <>
    <button class="button is-outlined is-danger" onClick={() => deleteTournament(id, onDeleteGuard)}>
      <Icon icon={faTrash} />
    </button>
  </>;
};

export default DeleteTournamentButton;
