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
import { useRef } from 'preact/hooks';
import ReactModal from 'react-modal';

import { useBlocker } from 'hooks/useBlocker';

import style from '../style.scss';

import { getModalClasses, getOverlayClasses } from '@/modals/Modal';

const BlockingModal: FunctionalComponent<ComponentProps<typeof ReactModal>> = (props) => {
  const { children, className, overlayClassName, bodyOpenClassName, contentRef, isOpen, ...aProps } = props;

  const modalRef = useRef<HTMLDivElement>();

  useBlocker(() => {
    if (modalRef.current && !modalRef.current.classList.contains(style.needsAction)) {
      modalRef.current.classList.add(style.needsAction);
      setTimeout(() => modalRef.current?.classList.remove(style.needsAction), 1100);
    }
    return false;
  }, isOpen);

  if (!isOpen) {
    return null;
  }

  return (
    <ReactModal
      className={getModalClasses(className)}
      overlayClassName={getOverlayClasses(overlayClassName)}
      bodyOpenClassName={bodyOpenClassName ?? null}
      closeTimeoutMS={500}
      isOpen={isOpen}
      contentRef={(ref) => {
        modalRef.current = ref;
        contentRef && contentRef(ref);
      }}
      {...aProps}
    >
      {children}
    </ReactModal>
  );
};

export default BlockingModal;
