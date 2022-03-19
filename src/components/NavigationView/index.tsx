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

import { faHandshake, faTableCells, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';

import Burger from '@/Burger';

const NavigationView: FunctionalComponent = () => {
  const [toggle, setToggle] = useState(false);

  const isActive = toggle ? ' is-active' : '';

  return (
    <div class="block">
      <div class={`navigation-view${isActive}`}>
        <Burger isActive={toggle} onClick={() => setToggle(t => !t)} />
        <aside class="menu">
          <p class="menu-label">
            General
          </p>
          <ul class="menu-list">
            <li>
              <a class="is-active">
                <span class="icon">
                  <Icon icon={faHandshake} />
                </span>
                Pairs
              </a>
            </li>
            <li>
              <a>
                <span class="icon">
                  <Icon icon={faUsers} />
                </span>
                Players
              </a>
            </li>
            <li>
              <a>
                <span class="icon">
                  <Icon icon={faTableCells} />
                </span>
                Tournament table
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default NavigationView;
