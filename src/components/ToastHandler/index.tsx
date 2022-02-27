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

import { h } from 'preact';
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.min.css';

export type DelayedToastData = {
  delayId?: ReturnType<typeof setTimeout>,
  toastId?: React.ReactText,
}

export const showDelayedToast = (toastFn: () => React.ReactText, delay: number): DelayedToastData => {
  const data: DelayedToastData = {};
  data.delayId = setTimeout(() => {
    data.toastId = toastFn();
    data.delayId = undefined;
  }, delay);
  return data;
};

export const dismissDelayedToast = (data: DelayedToastData | React.ReactText): void => {
  if (typeof data !== 'object') {
    toast.dismiss(data);
  }
  else if (data.delayId) {
    clearTimeout(data.delayId);
    data.delayId = undefined;
  }
  else if (data.toastId) {
    toast.dismiss(data.toastId);
    data.toastId = undefined;
  }
};

const ToastHandler = (): JSX.Element => (
  <ToastContainer
    position="top-right"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    draggablePercent={35}
    className="is-unselectable"
  />
);

export default ToastHandler;
