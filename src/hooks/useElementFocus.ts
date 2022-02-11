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

import { RefObject } from 'preact';
import { useCallback, useRef } from 'preact/hooks';

type FocusOnNextCallback = () => void
type FocusOnPrevCallback = () => void
type FocusOnFirstCallback = () => void

export function useElementFocus<H extends HTMLElement = HTMLElement>(
  initialRef: H | null = null
): [RefObject<H>, FocusOnNextCallback, FocusOnPrevCallback, FocusOnFirstCallback] {
  const ref = useRef<H>(initialRef);

  const focusOnNext: FocusOnNextCallback = useCallback(() => {
    if (ref.current?.nextElementSibling instanceof HTMLElement) {
      ref.current.nextElementSibling.focus();
      ref.current.nextElementSibling.scrollIntoView({ block: 'nearest' });
    }
  }, []);

  const focusOnPrev: FocusOnPrevCallback = useCallback(() => {
    if (ref.current?.previousElementSibling instanceof HTMLElement) {
      ref.current.previousElementSibling.focus();
      ref.current.previousElementSibling.scrollIntoView({ block: 'nearest' });
    }
  }, []);

  const focusOnFirst: FocusOnFirstCallback = useCallback(() => {
    const firstChild = ref.current?.parentElement?.firstElementChild;
    if (firstChild instanceof HTMLElement) {
      firstChild.focus();
    } else if (ref.current) {
      let sibling: Element = ref.current;
      let currSibling;
      while ((currSibling = ref.current.previousElementSibling)) {
        sibling = currSibling;
      }
      if (sibling instanceof HTMLElement) {
        sibling.focus();
      }
    }
  }, []);

  return [ref, focusOnNext, focusOnPrev, focusOnFirst];
}
