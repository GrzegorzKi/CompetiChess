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
import { clearIsModified, selectIsModified } from 'reducers/flagsReducer';
import { loadNewFromJson } from 'reducers/tournamentReducer';

import { readTournamentJsonFromLocalStorage } from 'utils/localStorageUtils';
import { blockIfModified } from 'utils/modalUtils';

import { useModalContext } from '../ModalProvider';

import { importTournamentFromJson } from '#/JsonImport';
import { store } from '@/store';

async function loadTournament(id: string, isModified: boolean, onModified?: () => Promise<boolean>) {
  if (onModified && !await blockIfModified(isModified, onModified)) return;

  try {
    const json = readTournamentJsonFromLocalStorage(id);
    if (json) {
      const data = importTournamentFromJson(json);
      store.dispatch(loadNewFromJson(data));
      store.dispatch(clearIsModified());

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
  const isModified = useAppSelector(selectIsModified);
  const { onSaveGuard } = useModalContext();

  return <>
    <button class="button" onClick={() => loadTournament(id, isModified, onSaveGuard)}>
      Load
    </button>
  </>;
};

export default LoadTournamentButton;
