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

import { CSSTransitionClassNames } from 'react-transition-group/CSSTransition';

export const CSSFade: CSSTransitionClassNames = {
  appear: 'fade-enter',
  appearDone: 'fade-enter-done',
  enter: 'fade-enter',
  enterDone: 'fade-enter-done',
  exit: 'fade-exit',
  exitActive: 'fade-exit-active',
  exitDone: 'fade-exit-done',
};

export const CSSFadeOnEntering = (node: HTMLElement, isAppearing: boolean) => {
  // Workaround for Preact, see https://github.com/preactjs/preact/issues/1790
  setTimeout(() => node.classList.add(isAppearing ? 'fade-appear-active' : 'fade-enter-active'), 10);
};

export const CSSFadeOnEntered = (node: HTMLElement, isAppearing: boolean) => {
  // Workaround for Preact, see https://github.com/preactjs/preact/issues/1790
  setTimeout(() => node.classList.remove(isAppearing ? 'fade-appear-active' : 'fade-enter-active'), 10);
};
