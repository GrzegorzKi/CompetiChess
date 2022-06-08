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

import { JSX } from 'preact';

export async function blockIfModified(isModified: boolean, onModified: () => Promise<boolean>): Promise<boolean> {
  if (isModified) {
    try {
      return await onModified();
    } catch (e) {
      return false;
    }
  }
  return true;
}

export function isModalOpen(className = 'ReactModal__Body--open'): boolean {
  return document.querySelector(`body.${className}`) !== null;
}

export function toggleLoading(e: JSX.TargetedEvent<HTMLButtonElement>, callback: () => unknown | Promise<unknown>): void {
  const el = e.currentTarget;
  el.classList.add('is-loading');
  setTimeout(async () => {
    await callback();
    el.classList.remove('is-loading');
  }, 10);
}
