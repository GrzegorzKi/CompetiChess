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
import { useCallback, useRef } from 'preact/hooks';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import SortingForm from 'features/TournamentSettings/SortingForm';
import { useAppDispatch } from 'hooks/index';
import useTournamentFormData from 'hooks/useTournamentFormData';
import { updateTournament } from 'reducers/tournamentReducer';
import { selectToNumberArray } from 'utils/common';
import { saveTournamentUnlessNotPersisted } from 'utils/localStorageUtils';


interface IProps {
  onCancel: () => void,
  onConfirm: () => void,
}

const SortPlayersModal: FunctionalComponent<IProps> = ({ onCancel, onConfirm }) => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const tournamentData = useTournamentFormData();

  const sortingSelectRef = useRef<HTMLSelectElement>();
  const sortingFormRef = useRef<UseFormReturn<any>>();

  const onSubmit = useCallback(() => {
    if (!sortingSelectRef.current || !sortingFormRef.current) {
      return;
    }

    tournamentData.sorters = sortingFormRef.current.getValues();
    tournamentData.sorters.sorters = selectToNumberArray(sortingSelectRef.current);

    dispatch(updateTournament(tournamentData));
    try {
      saveTournamentUnlessNotPersisted();
      onConfirm();
    } catch (e) {
      onCancel();
    }
  }, [dispatch, onCancel, onConfirm, tournamentData]);

  return (
    <>
      <header class="modal-card-head">
        <p class="modal-card-title">{t('Sorting')}</p>
        <button class="delete" aria-label="close" onClick={onCancel} />
      </header>
      <section className="modal-card-body">
        <SortingForm selectInputRef={sortingSelectRef}
                     formInputRef={sortingFormRef}
                     defaultValues={tournamentData.sorters} />
      </section>
      <footer class="modal-card-foot" style="overflow-x: auto;">
        <button class="button is-success" onClick={() => onSubmit()}>{t('OK')}</button>
        <button class="button is-outlined" onClick={onCancel}>{t('Cancel')}</button>
      </footer>
    </>
  );
};

export default SortPlayersModal;
