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
import { useCallback, useMemo, useRef } from 'preact/hooks';

type FocusOnNextCallback = () => boolean
type FocusOnPrevCallback = () => boolean
type FocusOnFirstCallback = () => void

function scrollIntoElement(element: Element, { top, bottom }: Offset) {
  const elementDistanceTop = element.getBoundingClientRect().top - top;
  if (elementDistanceTop < 0) {
    window.scrollBy({ top: elementDistanceTop, behavior: 'smooth' });
  } else {
    const elementDistanceBot = element.getBoundingClientRect().bottom + bottom - window.innerHeight;
    if (elementDistanceBot > 0) {
      window.scrollBy({ top: elementDistanceBot, behavior: 'smooth' });
    }
  }
}

type Offset = { top: number, bottom: number }

export function useElementFocus<H extends HTMLElement = HTMLElement>(
  initialRef: H | null = null,
  offset?: Offset
): [RefObject<H>, FocusOnNextCallback, FocusOnPrevCallback, FocusOnFirstCallback] {
  const ref = useRef<H>(initialRef);
  const _offset = useMemo(() => {
    return offset ?? {
      top: 58,
      bottom: 0,
    };
  }, [offset]);

  const focusOnNext: FocusOnNextCallback = useCallback(() => {
    if (ref.current?.nextElementSibling instanceof HTMLElement) {
      ref.current.nextElementSibling.focus({ preventScroll: true });
      scrollIntoElement(ref.current.nextElementSibling, _offset);
      return true;
    }
    return false;
  }, [_offset]);

  const focusOnPrev: FocusOnPrevCallback = useCallback(() => {
    if (ref.current?.previousElementSibling instanceof HTMLElement) {
      ref.current.previousElementSibling.focus({ preventScroll: true });
      scrollIntoElement(ref.current.previousElementSibling, _offset);
      return true;
    }
    return false;
  }, [_offset]);

  const focusOnFirst: FocusOnFirstCallback = useCallback(() => {
    if (ref.current) {
      let el = ref.current.parentElement?.firstElementChild;
      if (!el) {
        el = ref.current;

        let currSibling;
        while ((currSibling = ref.current.previousElementSibling)) {
          el = currSibling;
        }
      }

      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: true });
      }
      scrollIntoElement(el, _offset);
    }
  }, [_offset]);

  return [ref, focusOnNext, focusOnPrev, focusOnFirst];
}
