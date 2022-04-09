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
import { useCallback } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'hooks';
import usePromiseModal from 'hooks/usePromiseModal';
import { createNextRound, selectPairs, selectPlayers } from 'reducers/tournamentReducer';

import InitialColorModal from '@/NextRoundButton/InitialColorModal';


const NextRoundButton: FunctionalComponent = () => {
  const { t } = useTranslation();

  const pairs = useAppSelector(selectPairs);
  const players = useAppSelector(selectPlayers);
  const dispatch = useAppDispatch();

  const [onConfirm, onCancel, isOpen, openModal] = usePromiseModal('initialColorModal');

  const _createNextRound = useCallback(async () => {
    const pairsLength = pairs?.length || 0;

    if (!players || players.orderById.length < 3) {
      toast.error(t('Too few players'));
      return null;
    }

    if (pairsLength === 0) {
      if (!await openModal()) {
        return null;
      }
    }

    dispatch(createNextRound());
  }, [dispatch, openModal, pairs?.length, players, t]);

  return <>
    <button class="button is-success trans-bg" onClick={_createNextRound}>
      <strong>{t('Start next round')}</strong>
    </button>
    <InitialColorModal
      stateKey="initialColorModal"
      isActive={isOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  </>;
};

export default NextRoundButton;
