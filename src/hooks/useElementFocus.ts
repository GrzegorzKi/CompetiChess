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

import { RefCallback, RefObject } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';

type FocusOnNextCallback = () => boolean
type FocusOnPrevCallback = () => boolean
type FocusOnFirstCallback = () => void

function getDocumentScrollingElement() {
  return document.scrollingElement ?? document.body;
}

function getScrollParent(element: HTMLElement, includeHidden = true): Element {
  let style = getComputedStyle(element);
  const excludeStaticParent = style.position === 'absolute';
  const overflowRegex = includeHidden ? /(visible|hidden)/ : /(visible)/;

  if (style.position === 'fixed') {
    return getDocumentScrollingElement();
  }

  let parent: HTMLElement | null = element;
  while ((parent = parent.parentElement)) {
    style = getComputedStyle(parent);
    if (excludeStaticParent && style.position === 'static') {
      continue;
    }
    if (!overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
      return parent;
    }
  }

  return getDocumentScrollingElement();
}

function scrollIntoElement(element: Element, { top, bottom }: Offset, scrolledElement?: Element | null) {
  if (!scrolledElement) {
    scrolledElement = getDocumentScrollingElement();
  }
  const { top: scrollTop, bottom: scrollBot } = scrolledElement.getBoundingClientRect();

  const elementDistanceTop = element.getBoundingClientRect().top - top - scrollTop;
  if (elementDistanceTop < 0) {
    scrolledElement.scrollBy({ top: elementDistanceTop, behavior: 'smooth' });
  } else {
    const elementDistanceBot = element.getBoundingClientRect().bottom + bottom - scrollBot;
    if (elementDistanceBot > 0) {
      scrolledElement.scrollBy({ top: elementDistanceBot, behavior: 'smooth' });
    }
  }
}

type Offset = { top: number, bottom: number }

export interface UseElementFocusProps<H extends HTMLElement> {
  initialRef?: H | null,
  offset?: Offset
}

export default function useElementFocus<H extends HTMLElement = HTMLElement>({
  initialRef = null,
  offset
}: UseElementFocusProps<H>): [RefObject<H>, RefCallback<H>, FocusOnNextCallback, FocusOnPrevCallback, FocusOnFirstCallback] {
  const ref = useRef<H | null>(initialRef);
  const [_offset] = useState(() => {
    return offset ?? {
      top: 2,
      bottom: 0,
    };
  });

  const scrollParent = useRef<Element | null>(ref.current ? getScrollParent(ref.current) : null);
  const setRef = useCallback((node: H | null) => {
    if (ref.current && !scrollParent.current) {
      scrollParent.current = getScrollParent(ref.current);
    }

    ref.current = node;
  }, []);

  const focusOnNext: FocusOnNextCallback = useCallback(() => {
    if (ref.current?.nextElementSibling instanceof HTMLElement) {
      ref.current.nextElementSibling.focus({ preventScroll: true });
      scrollIntoElement(ref.current.nextElementSibling, _offset, scrollParent.current);
      return true;
    }
    return false;
  }, [_offset]);

  const focusOnPrev: FocusOnPrevCallback = useCallback(() => {
    if (ref.current?.previousElementSibling instanceof HTMLElement) {
      ref.current.previousElementSibling.focus({ preventScroll: true });
      scrollIntoElement(ref.current.previousElementSibling, _offset, scrollParent.current);
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
      scrollIntoElement(el, _offset, scrollParent.current);
    }
  }, [_offset]);

  return [ref, setRef, focusOnNext, focusOnPrev, focusOnFirst];
}
