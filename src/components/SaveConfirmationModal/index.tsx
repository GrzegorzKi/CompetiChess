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
import Modal from 'react-modal';

import { saveTournamentToLocalStorage } from '../../utils/localStorageUtils';

import style from './style.scss';

import { RootState, store } from '@/store';

interface Props {
  isOpen: boolean,
  onCancel: () => void,
  onConfirm: () => void,
}

const SaveConfirmationModal: FunctionalComponent<Props> = ({ isOpen, onCancel, onConfirm }) => {

  const saveAndConfirm = useCallback(() => {
    const storeState = store.getState() as RootState;
    saveTournamentToLocalStorage(storeState.tournament);

    onConfirm();
  }, [onConfirm]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      className={`modal-card ${style.modal}`}
      overlayClassName={style.modalOverlay}
      isOpen={isOpen}
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
      <footer className="modal-card-foot">
        <button class="button is-success" onClick={saveAndConfirm}>Save changes</button>
        <button class="button is-outlined is-danger" onClick={onConfirm}>Don't save</button>
        <button class="button is-outlined" onClick={onCancel}>Cancel</button>
      </footer>
    </Modal>
  );
};

export default SaveConfirmationModal;
