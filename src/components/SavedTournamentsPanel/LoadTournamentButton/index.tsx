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

import usePromiseModal from 'hooks/usePromiseModal';
import { loadNewFromJson } from 'reducers/tournamentReducer';

import { readTournamentJsonFromLocalStorage } from 'utils/localStorageUtils';
import { blockIfModified } from 'utils/modalUtils';

import { importTournamentFromJson } from '#/JsonImport';
import SaveConfirmationModal from '@/modals/SaveConfirmationModal';
import { store } from '@/store';

async function loadTournament(id: string, onModified: () => Promise<boolean>) {
  if (!await blockIfModified(onModified)) return;

  try {
    const json = readTournamentJsonFromLocalStorage(id);
    if (json) {
      const data = importTournamentFromJson(json);
      store.dispatch(loadNewFromJson(data));

      const successText = <>Tournament <strong>{data.tournament.tournamentName}</strong> loaded successfully!</>;
      toast.success(successText);
      return;
    }
  } catch (e) { /* Pass-through */ }

  toast.error('Provided invalid file or file content is not a JSON object');
}

interface Props {
  id: string;
}

const LoadTournamentButton: FunctionalComponent<Props> = ({ id }) => {
  const [onConfirm, onCancel, isOpen, openModal] = usePromiseModal();

  return <>
    <button class="button" onClick={() => loadTournament(id, openModal)}>
      Load
    </button>
    <SaveConfirmationModal
      isOpen={isOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  </>;
};

export default LoadTournamentButton;
