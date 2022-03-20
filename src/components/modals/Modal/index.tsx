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

import { ComponentProps, FunctionalComponent, h } from 'preact';
import ReactModal from 'react-modal';

import style from '../style.scss';

const Modal: FunctionalComponent<ComponentProps<typeof ReactModal>> = (props) => {
  const { children, className, overlayClassName, bodyOpenClassName, isOpen, ...aProps } = props;

  let modalClassName: string | ReactModal.Classes;
  if (typeof className === 'string') {
    modalClassName = {
      base: `modal-card ${className} ${style.modal}`,
      afterOpen: style.modalAfterOpen,
      beforeClose: style.modalBeforeClose,
    };
  } else {
    modalClassName = className ?? {
      base: `modal-card ${style.modal}`,
      afterOpen: style.modalAfterOpen,
      beforeClose: style.modalBeforeClose,
    };
  }

  return (
    <ReactModal
      className={modalClassName}
      overlayClassName={overlayClassName ?? {
        base: style.modalOverlay,
        afterOpen: style.modalOverlayAfterOpen,
        beforeClose: style.modalOverlayBeforeClose,
      }}
      closeTimeoutMS={500}
      bodyOpenClassName={bodyOpenClassName ?? undefined}
      isOpen={isOpen}
      {...aProps}
    >
      {children}
    </ReactModal>
  );
};

export default Modal;
