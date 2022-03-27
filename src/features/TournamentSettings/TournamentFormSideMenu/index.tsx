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

import { faHandScissors, faMicrochip, faRectangleList } from '@fortawesome/free-solid-svg-icons';
import { FunctionalComponent,h  } from 'preact';
import { useCallback, useState } from 'preact/hooks';

import { Tab } from '..';

import Burger from '@/Burger';
import SideMenu, { TabLink } from '@/SideMenu';

interface IProps<T> {
  activeTab: T;
  onChange: (value: T) => void;
}

const TournamentFormSideMenu: FunctionalComponent<IProps<Tab>> = ({ activeTab, onChange: _onChange }) => {
  const [expanded, setExpanded] = useState(false);

  const onChange = useCallback((tab: Tab) => {
    setExpanded(false);
    _onChange(tab);
  }, [_onChange]);

  return (
    <SideMenu isActive={expanded}>
      <Burger isActive={expanded} onClick={() => setExpanded(s => !s)} />
      <p class="menu-label">General</p>
      <ul class="menu-list">
        <TabLink activeTab={activeTab} onChange={onChange} tab='General' icon={faRectangleList} />
        <TabLink activeTab={activeTab} onChange={onChange} tab='Tiebreakers' icon={faHandScissors} />
        <TabLink activeTab={activeTab} onChange={onChange} tab='Matchmaking' icon={faMicrochip} />
      </ul>
    </SideMenu>
  );
};

export default TournamentFormSideMenu;
