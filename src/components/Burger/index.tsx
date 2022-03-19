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

interface IProps {
  isActive: boolean;
  onClick: () => void;
  isActiveClass?: string;
}

const Burger: FunctionalComponent<IProps> = ({ onClick, isActive, isActiveClass = 'is-active' }) => (
  <a role="button" class={`navbar-burger ${isActive ? isActiveClass : ''}`}
     aria-label="menu" aria-expanded={isActive}
     onClick={onClick}>
    <span aria-hidden="true" />
    <span aria-hidden="true" />
    <span aria-hidden="true" />
  </a>
);

export default Burger;
