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

import { FunctionalComponent, h, JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import style from './style.scss';

import {
  ComputedResults, computeResult,
  parseResultString,
  ResultType,
  toResultString,
} from '#/utils/ResultUtils';
import { store } from '@/store';

const parseResult = (event: JSX.TargetedEvent<HTMLInputElement>) => {
  const configuration = store.getState().tournament.configuration;
  if (configuration) {
    const value = event.currentTarget.value;
    return parseResultString(value, configuration);
  }
  return undefined;
};

interface IProps {
  score: ComputedResults;
  setScore: (result: ComputedResults) => void;
  onConfirm?: (result: ComputedResults) => void;
}

const SetScoreBox: FunctionalComponent<IProps> = ({ score, setScore, onConfirm }) => {

  const callbackRef = useCallback((inputElement: HTMLElement | null) => {
    setTimeout(() => inputElement && inputElement.focus(), 0);
  }, []);

  const handleInput = useCallback((event: JSX.TargetedEvent<HTMLInputElement>) => {
    const result = parseResult(event);
    if (result) {
      setScore(result);
      return result;
    }
  }, [setScore]);

  const onKeyEnter: JSX.KeyboardEventHandler<HTMLInputElement> = useCallback((event) => {
    if (event.key === 'Enter' && onConfirm) {
      const result = handleInput(event);
      result && onConfirm(result);
    }
  }, [handleInput, onConfirm]);

  const setResult = useCallback((type: ResultType) => {
    const result = computeResult(type);
    setScore(result);
  }, [setScore]);

  return (
    <div class={`box ${style.buttons}`}>
      <div class="field has-addons is-justify-content-center">
        <div class="control">
          <input type="text" placeholder="Score (e.g. 1:0)"
                 aria-label="Score input" class="input mb-3"
                 ref={callbackRef} value={toResultString(score)}
                 onBlur={handleInput} onKeyPress={onKeyEnter}
          />
        </div>
        <div class="control">
          <button type="reset" class="button is-info"
                  onClick={() => setResult('RESET')}>
            Clear
          </button>
        </div>
      </div>
      <div class={style.buttonsRow}>
        <button onClick={() => setResult('WHITE_WIN')}
                class="button">1 : 0</button>
        <button onClick={() => setResult('DRAW')}
                class="button">= : =</button>
        <button onClick={() => setResult('BLACK_WIN')}
                class="button">0 : 1</button>
      </div>
      <div class={style.buttonsRow}>
        <button onClick={() => setResult('WHITE_FORFEIT_WIN')}
                class="button">+ : -</button>
        <button onClick={() => setResult('BLACK_FORFEIT_WIN')}
                class="button">- : +</button>
        <button onClick={() => setResult('FORFEIT')}
                class="button">- : -</button>
      </div>
      <div class={style.buttonsRow}>
        <button onClick={() => setResult('ZERO_ZERO')}
                class="button">0 : 0</button>
        <button onClick={() => setResult('BLACK_HALF_POINT')}
                class="button">0 : =</button>
        <button onClick={() => setResult('WHITE_HALF_POINT')}
                class="button">= : 0</button>
      </div>
    </div>
  );
};

export default SetScoreBox;
