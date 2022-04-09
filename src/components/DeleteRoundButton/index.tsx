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

import { useAppDispatch, useAppSelector } from 'hooks';
import usePromiseModal from 'hooks/usePromiseModal';
import { deleteRound, selectPairs, selectViewOptions } from 'reducers/tournamentReducer';

import DeleteRoundModal from '@/DeleteRoundButton/DeleteRoundModal';

const DeleteRoundButton: FunctionalComponent = () => {
  const { t } = useTranslation();

  const pairs = useAppSelector(selectPairs);
  const { selectedRound } = useAppSelector(selectViewOptions);
  const dispatch = useAppDispatch();

  const [onConfirm, onCancel, isOpen, openModal] = usePromiseModal('deleteRound');

  const _deleteRound = useCallback(async () => {
    if (!await openModal()) {
      return;
    }

    dispatch(deleteRound());
  }, [dispatch, openModal]);

  return <>
    <button class="button is-danger is-outlined trans-bg"
            onClick={_deleteRound}
            disabled={!pairs || pairs.length === 0 || selectedRound !== pairs.length - 1}
    >
      <strong>{t('Delete round')}</strong>
    </button>
    <DeleteRoundModal
      isActive={isOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  </>;
};

export default DeleteRoundButton;
