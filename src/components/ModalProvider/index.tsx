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

import { createContext, FunctionalComponent, h } from 'preact';
import { useContext } from 'preact/hooks';

import usePromiseModal from 'hooks/usePromiseModal';

import DeleteModal from '@/modals/DeleteModal';
import SaveConfirmationModal from '@/modals/SaveConfirmationModal';

export interface IModalContext {
  onSaveGuard?: () => Promise<boolean>;
  onDeleteGuard?: () => Promise<boolean>;
}

export const ModalContext = createContext<IModalContext>({});

export const useModalContext = () => useContext(ModalContext);

export const ModalProvider: FunctionalComponent = ({ children }) => {
  const [onConfirm, onCancel, isOpen, openModal] = usePromiseModal();
  const [onConfirmDelete, onCancelDelete, isOpenDelete, openModalDelete] = usePromiseModal();

  return (
    <>
      <ModalContext.Provider value={{ onSaveGuard: openModal, onDeleteGuard: openModalDelete }}>
        {children}
      </ModalContext.Provider>
      <SaveConfirmationModal
        isOpen={isOpen}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
      <DeleteModal
        isOpen={isOpenDelete}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
      />
    </>
  );
};
