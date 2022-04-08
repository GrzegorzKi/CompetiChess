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
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useAppSelector } from 'hooks/index';
import { clearIsModified, selectIsModified } from 'reducers/flagsReducer';
import { loadNewFromJson } from 'reducers/tournamentReducer';

import { readTournamentJsonFromLocalStorage } from 'utils/localStorageUtils';
import { blockIfModified } from 'utils/modalUtils';

import { importTournamentFromJson } from '#/JsonImport';
import { store } from '@/store';
import TransText from '@/TransText';

export async function loadTournament(
  id: string,
  isModified: boolean,
  onModified?: () => Promise<boolean>,
): Promise<void> {
  if (onModified && !await blockIfModified(isModified, onModified)) return;

  try {
    const json = readTournamentJsonFromLocalStorage(id);
    if (json) {
      const data = importTournamentFromJson(json);
      store.dispatch(loadNewFromJson(data));
      store.dispatch(clearIsModified());

      toast.success(<Trans i18nKey="Tournament loaded">
        Tournament <strong>{{ name: data.tournament.tournamentName }}</strong> loaded successfully!
      </Trans>);
      return;
    }
  } catch (e) { /* Pass-through */ }

  toast.error(<TransText i18nKey='Invalid file' />);
}

interface Props {
  id: string;
  onSaveGuard?: () => Promise<boolean>;
}

const LoadTournamentButton: FunctionalComponent<Props> = ({ id, onSaveGuard }) => {
  const { t } = useTranslation();

  const isModified = useAppSelector(selectIsModified);

  return <>
    <button class="button" onClick={() => loadTournament(id, isModified, onSaveGuard)}>
      {t('Load')}
    </button>
  </>;
};

export default LoadTournamentButton;
