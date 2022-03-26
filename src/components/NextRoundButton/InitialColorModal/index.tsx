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
import { useCallback, useState } from 'preact/hooks';

import { useAppDispatch } from 'hooks/index';
import { setInitialColor } from 'reducers/tournamentReducer';

import style from './style.scss';

import { Color } from '#/types/Tournament';
import LocationStateModal from '@/modals/LocationStateModal';


interface IContentProps {
  onCancel: () => void,
  onConfirm: () => void,
}

const InitialColorModalContent: FunctionalComponent<IContentProps> = ({ onCancel, onConfirm }) => {
  const [color, setColor] = useState(Color.WHITE);
  const dispatch = useAppDispatch();

  const setColorAndConfirm = useCallback(() => {
    dispatch(setInitialColor(color));
    onConfirm();
  }, [color, dispatch, onConfirm]);

  return (
    <>
      <header class="modal-card-head">
        <p class="modal-card-title">Select initial color</p>
        <button class="delete" aria-label="close" onClick={onCancel} />
      </header>
      <section class="modal-card-body">
        <fieldset class={`control ${style.radioGroup}`}>
          <legend>Select color for the first player:</legend>
          <p>
            <label class="radio">
              <input
                type="radio"
                name="color"
                onChange={() => setColor(Color.WHITE)}
              />
              White
            </label>
          </p>

          <p>
            <label class="radio">
              <input
                type="radio"
                name="color"
                onChange={() => setColor(Color.BLACK)}
              />
              Black
            </label>
          </p>

          <p>
            <label class="radio">
              <input
                type="radio"
                name="color"
                onChange={() => setColor(Color.NONE)}
              />
              Random
            </label>
          </p>
        </fieldset>
      </section>
      <footer class="modal-card-foot" style="overflow-x: auto;">
        <button class="button is-success" onClick={setColorAndConfirm}>OK</button>
        <button class="button is-outlined ml-auto" onClick={onCancel}>Cancel</button>
      </footer>
    </>
  );
};

interface IProps {
  stateKey: string;
  isActive: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const InitialColorModal: FunctionalComponent<IProps> = ({ stateKey, isActive, onCancel, onConfirm }) => {
  return (
    <LocationStateModal
      stateKey={stateKey}
      isActive={isActive}
      onRequestClose={onCancel}
      contentLabel="Select color for the first player"
      style={{
        content: {
          width: '320px',
          margin: '0 auto'
        }
      }}
    >
      <InitialColorModalContent onCancel={onCancel} onConfirm={onConfirm} />
    </LocationStateModal>
  );
};

export default InitialColorModal;
