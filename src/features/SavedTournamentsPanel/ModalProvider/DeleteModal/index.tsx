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

import LocationStateModal from '@/modals/LocationStateModal';

interface IProps {
  stateKey: string;
  isActive: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteModal: FunctionalComponent<IProps> = ({ stateKey, isActive, onCancel, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <LocationStateModal
      isActive={isActive}
      stateKey={stateKey}
      onRequestClose={onCancel}
      contentLabel="Delete tournament confirmation modal"
    >
      <header class="modal-card-head">
        <p class="modal-card-title">{t('Confirm deletion')}</p>
        <button class="delete" aria-label="close" onClick={onCancel} />
      </header>
      <section class="modal-card-body">
        <div>{t('Delete tournament prompt')}</div>
      </section>
      <footer class="modal-card-foot" style="overflow-x: auto;">
        <button class="button is-danger" onClick={onConfirm}>{t('Yes')}</button>
        <button class="button is-outlined" onClick={onCancel}>{t('No')}</button>
      </footer>
    </LocationStateModal>
  );
};

export default DeleteModal;
