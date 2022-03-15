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
import { useCallback } from 'preact/hooks';

import useTouchCheck from './useTouchCheck';

export default function useContextMenuHandler<T extends EventTarget>(
  handler: (event: JSX.TargetedMouseEvent<T>) => void): JSX.MouseEventHandler<T> {
  const isMobile = useTouchCheck();

  return useCallback((event) => {
    // We don't want to disable native context menu for mobile users
    // (for example, in case of selecting text)
    if (!isMobile) {
      event.preventDefault();
    }

    handler(event);
  }, [isMobile, handler]);
}
