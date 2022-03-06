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

import usePromiseModal from 'hooks/usePromiseModal';
import { close } from 'reducers/tournamentReducer';
import { removeTournamentFromLocalStorage } from 'utils/localStorageUtils';

import DeleteModal from '@/modals/DeleteModal';
import { store } from '@/store';

async function deleteTournament(id: string, openModal: () => Promise<unknown>) {
  if (!await openModal()) return;

  removeTournamentFromLocalStorage(id);
  const state = store.getState();
  if (state.tournament.tournament?.id === id) {
    store.dispatch(close());
  }

  toast.info('Tournament has been deleted');
}

interface Props {
  id: string;
}

const DeleteTournamentButton: FunctionalComponent<Props> = ({ id }) => {
  const [onConfirm, onCancel, isOpen, openModal] = usePromiseModal();

  return <>
    <button class="button is-outlined is-danger" onClick={() => deleteTournament(id, openModal)}>
      <Icon icon={faTrash} />
    </button>
    <DeleteModal
      isOpen={isOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  </>;
};

export default DeleteTournamentButton;
