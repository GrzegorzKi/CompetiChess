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

import { getModalClasses, getOverlayClasses } from '@/modals/Modal';

const LocationStateModal: FunctionalComponent<Omit<ComponentProps<typeof ReactModal>, 'isOpen'> & { stateKey: string, isActive?: boolean }> = (props) => {
  const { stateKey, isActive, children, className, overlayClassName, bodyOpenClassName, onRequestClose, ...aProps } = props;

  const navigate = useNavigate();
  const { state } = useLocation();

  const isOpen = !!state && stateKey in (state as any);
  const prevIsOpen = useRef(isOpen);

  useEffect(() => {
    if (prevIsOpen.current && !isOpen && (isActive === undefined || isActive === true)) {
      onRequestClose?.(new MouseEvent('click') as any);
    }
    prevIsOpen.current = isOpen;
  }, [isActive, isOpen, onRequestClose]);

  useEffect(() => {
    if (isActive === false && isOpen) {
      navigate(-1);
    }
    // We don't want "isActive" to trigger.
    // This check is designed to keep modal closed after page refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, navigate]);

  return (
    <ReactModal
      className={getModalClasses(className)}
      overlayClassName={getOverlayClasses(overlayClassName)}
      bodyOpenClassName={bodyOpenClassName ?? undefined}
      closeTimeoutMS={500}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      {...aProps}
    >
      {children}
    </ReactModal>
  );
};

export default LocationStateModal;
