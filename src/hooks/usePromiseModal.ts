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

import { useCallback, useState } from 'preact/hooks';

const noop = () => {/**/};
type PromiseType<T> = (value: T) => void;
type TOrFalse<T> = T | false;

interface PromiseInfoState<T> {
  isOpen: boolean,
  resolve: PromiseType<T | false>,
  reject: PromiseType<false>,
}

export default function usePromiseModal(): [() => void, () => void, boolean, () => Promise<boolean>] {
  const [promiseInfo, setPromiseInfo] = useState({
    isOpen: false,
    resolve: noop,
    reject: noop
  } as PromiseInfoState<boolean>);

  const openModal = useCallback(() => {
    if (promiseInfo.isOpen) {
      return Promise.reject(false);
    }
    return new Promise<boolean>((resolve, reject) => {
      setPromiseInfo({ isOpen: true, resolve, reject });
    });
  }, [promiseInfo.isOpen]);

  const onConfirm = useCallback(() => {
    setPromiseInfo(prevInfo => {
      prevInfo.resolve(true);
      return { isOpen: false, resolve: noop, reject: noop };
    });
  }, []);

  const onCancel = useCallback(() => {
    setPromiseInfo(prevInfo => {
      prevInfo.resolve(false);
      return { isOpen: false, resolve: noop, reject: noop };
    });
  }, []);

  return [onConfirm, onCancel, promiseInfo.isOpen, openModal];
}

export function usePromiseModalWithReturn<T>(): [(value: T) => void, () => void, boolean, () => Promise<TOrFalse<T>>] {
  const [promiseInfo, setPromiseInfo] = useState({
    isOpen: false,
    resolve: noop,
    reject: noop
  } as PromiseInfoState<T>);

  const openModal = useCallback(() => {
    if (promiseInfo.isOpen) {
      return Promise.reject(false);
    }
    return new Promise<TOrFalse<T>>((resolve, reject) => {
      setPromiseInfo({ isOpen: true, resolve, reject });
    });
  }, [promiseInfo.isOpen]);

  const onConfirm = useCallback((value: T) => {
    setPromiseInfo(prevInfo => {
      prevInfo.resolve(value);
      return { isOpen: false, resolve: noop, reject: noop };
    });
  }, []);

  const onCancel = useCallback(() => {
    setPromiseInfo(prevInfo => {
      prevInfo.resolve(false);
      return { isOpen: false, resolve: noop, reject: noop };
    });
  }, []);

  return [onConfirm, onCancel, promiseInfo.isOpen, openModal];
}
