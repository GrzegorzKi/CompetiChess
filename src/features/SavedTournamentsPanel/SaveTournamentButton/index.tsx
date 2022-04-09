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
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useAppSelector } from 'hooks/index';
import { clearIsModified } from 'reducers/globalReducer';
import { selectTournament } from 'reducers/tournamentReducer';

import { saveTournamentToLocalStorage } from 'utils/localStorageUtils';

import { RootState, store } from '@/store';
import TransText from '@/TransText';

export function saveTournament(): void {
  try {
    const storeState = store.getState() as RootState;

    const saved = saveTournamentToLocalStorage(storeState.tournament);
    if (saved) {
      store.dispatch(clearIsModified());
      toast.success(<TransText i18nKey='Tournament saved!' />);
    } else {
      toast.warning(<TransText i18nKey='Nothing to save' />);
    }

  } catch (e) {
    toast.error(<TransText i18nKey='Unable to save' />);
  }
}

const SaveTournamentButton: FunctionalComponent = () => {
  const { t } = useTranslation();

  const tournament = useAppSelector(selectTournament);

  return <button disabled={!tournament} class="button" onClick={() => saveTournament()}>
    {t('Save')}
  </button>;
};

export default SaveTournamentButton;
