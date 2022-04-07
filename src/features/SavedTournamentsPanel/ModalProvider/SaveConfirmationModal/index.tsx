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

import { useAppDispatch } from 'hooks/index';
import { clearIsModified } from 'reducers/globalReducer';
import { saveTournamentToLocalStorage } from 'utils/localStorageUtils';

import LocationStateModal from '@/modals/LocationStateModal';
import { RootState, store } from '@/store';

interface IProps {
  stateKey: string;
  isActive: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const SaveConfirmationModal: FunctionalComponent<IProps> = ({ stateKey, isActive, onCancel, onConfirm }) => {
  const dispatch = useAppDispatch();
  const saveAndConfirm = useCallback(() => {
    const storeState = store.getState() as RootState;
    saveTournamentToLocalStorage(storeState.tournament);
    dispatch(clearIsModified());

    onConfirm();
  }, [dispatch, onConfirm]);

  return (
    <LocationStateModal
      stateKey={stateKey}
      isActive={isActive}
      onRequestClose={onCancel}
      contentLabel="Save tournament confirmation modal"
    >
      <header class="modal-card-head">
        <p class="modal-card-title">Confirm</p>
        <button class="delete" aria-label="close" onClick={onCancel} />
      </header>
      <section className="modal-card-body">
        <div>Do you want to save tournament?</div>
      </section>
      <footer class="modal-card-foot" style="overflow-x: auto;">
        <button class="button is-success" onClick={saveAndConfirm}>Save</button>
        <button class="button is-outlined is-danger" onClick={onConfirm}>Don't save</button>
        <button class="button is-outlined ml-auto" onClick={onCancel}>Cancel</button>
      </footer>
    </LocationStateModal>
  );
};

export default SaveConfirmationModal;
