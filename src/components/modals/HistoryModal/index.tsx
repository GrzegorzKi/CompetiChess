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
import { useEffect, useRef } from 'preact/hooks';
import ReactModal from 'react-modal';
import { useLocation, useNavigate } from 'react-router-dom';

import style from '../style.scss';

export function getModalClasses(className?: string | ReactModal.Classes): ReactModal.Classes {
  if (typeof className === 'string') {
    return {
      base: `modal-card ${className} ${style.modal}`,
      afterOpen: style.modalAfterOpen,
      beforeClose: style.modalBeforeClose,
    };
  }

  return className ?? {
    base: `modal-card ${style.modal}`,
    afterOpen: style.modalAfterOpen,
    beforeClose: style.modalBeforeClose,
  };
}

export function getOverlayClasses(className?: string | ReactModal.Classes): ReactModal.Classes {
  if (typeof className === 'string') {
    return {
      base: `${className} ${style.modalOverlay}`,
      afterOpen: style.modalOverlayAfterOpen,
      beforeClose: style.modalOverlayBeforeClose,
    };
  }

  return className ?? {
    base: style.modalOverlay,
    afterOpen: style.modalOverlayAfterOpen,
    beforeClose: style.modalOverlayBeforeClose,
  };
}

const HistoryModal: FunctionalComponent<ComponentProps<typeof ReactModal> & { stateKey: string, setIsOpen: (open: boolean) => void }> = (props) => {
  const { stateKey, setIsOpen, children, className, overlayClassName, bodyOpenClassName, isOpen, ...aProps } = props;

  const navigate = useNavigate();
  const { state, pathname } = useLocation();

  const prevIsOpen = useRef(isOpen);
  useEffect(() => {
    const hasStateKey = state && stateKey in (state as any);
    if (prevIsOpen.current && !hasStateKey) {
      prevIsOpen.current = false;
      setIsOpen(false);
    } else if (!prevIsOpen.current && hasStateKey) {
      prevIsOpen.current = true;
      setIsOpen(true);
    } else {
      if (isOpen && !hasStateKey) {
        navigate(pathname, { state: { [stateKey]: true } });
      } else if (!isOpen && hasStateKey) {
        navigate(-1);
      }
      prevIsOpen.current = isOpen;
    }

  }, [isOpen, navigate, pathname, setIsOpen, state, stateKey]);

  return (
    <ReactModal
      className={getModalClasses(className)}
      overlayClassName={getOverlayClasses(overlayClassName)}
      bodyOpenClassName={bodyOpenClassName ?? undefined}
      closeTimeoutMS={500}
      isOpen={isOpen}
      {...aProps}
    >
      {children}
    </ReactModal>
  );
};

export default HistoryModal;
