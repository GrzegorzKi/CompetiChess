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
import { useCallback } from 'preact/hooks';
import ReactModal from 'react-modal';
import { useLocation } from 'react-router-dom';

import { getModalClasses, getOverlayClasses } from '@/modals/Modal';

const LocationStateModal: FunctionalComponent<Omit<ComponentProps<typeof ReactModal>, 'isOpen'> & { stateKey: string }> = (props) => {
  const { stateKey, children, className, overlayClassName, bodyOpenClassName, onRequestClose, ...aProps } = props;

  const { state } = useLocation();

  let isOpen = false;
  if (state && stateKey in (state as any)) {
    isOpen = true;
  }
  const onClose = useCallback(() => {
    onRequestClose?.(new MouseEvent('click') as any);
  }, [onRequestClose]);

  return (
    <ReactModal
      className={getModalClasses(className)}
      overlayClassName={getOverlayClasses(overlayClassName)}
      bodyOpenClassName={bodyOpenClassName ?? undefined}
      closeTimeoutMS={500}
      isOpen={isOpen}
      onRequestClose={onClose}
      {...aProps}
    >
      {children}
    </ReactModal>
  );
};

export default LocationStateModal;
