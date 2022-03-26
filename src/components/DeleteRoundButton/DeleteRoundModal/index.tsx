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

import Modal from '@/modals/Modal';

interface IProps {
  isOpen: boolean,
  onCancel: () => void,
  onConfirm: () => void,
}

const DeleteRoundModal: FunctionalComponent<IProps> = ({ isOpen, onCancel, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      contentLabel="Delete round confirmation modal"
    >
      <header class="modal-card-head">
        <p class="modal-card-title">Confirm deletion</p>
        <button class="delete" aria-label="close" onClick={onCancel} />
      </header>
      <section className="modal-card-body">
        <div>Are you sure you want to delete round?</div>
      </section>
      <footer class="modal-card-foot" style="overflow-x: auto;">
        <button class="button is-danger" onClick={onConfirm}>Yes</button>
        <button class="button is-outlined" onClick={onCancel}>No</button>
      </footer>
    </Modal>
  );
};

export default DeleteRoundModal;