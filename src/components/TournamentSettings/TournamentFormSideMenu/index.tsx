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

import { faArrowDown19, faForwardFast, faHandScissors, faMicrochip, faRectangleList, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { FunctionalComponent,h  } from 'preact';

import style from './style.scss';

export type Tab = 'General' | 'Tiebreakers' | 'Accelerations' | 'Sorting criteria' | 'Matchmaking';

interface IProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

interface ITabLinkProps extends IProps {
  tab: Tab;
  icon?: IconDefinition;
}

const TabLink: FunctionalComponent<ITabLinkProps> = ({ activeTab, onChange, tab, icon }) => {
  return <li>
    <a class={`is-unselectable ${activeTab === tab ? 'is-active' : ''}`} onClick={() => onChange(tab)}>
      {icon && <span className="icon"><Icon icon={icon} /></span>}
      <span class={style.sideNavText}>{tab}</span>
    </a>
  </li>;
};

const TournamentFormSideMenu: FunctionalComponent<IProps> = ({ activeTab, onChange }) => {

  return (
    <aside class={`menu ${style.sideNav}`}>
      <p class="menu-label">General</p>
      <ul class="menu-list">
        <TabLink activeTab={activeTab} onChange={onChange} tab='General' icon={faRectangleList} />
        <TabLink activeTab={activeTab} onChange={onChange} tab='Tiebreakers' icon={faHandScissors} />
        <TabLink activeTab={activeTab} onChange={onChange} tab='Accelerations' icon={faForwardFast} />
      </ul>
      <p class="menu-label">Players & rounds</p>
      <ul class="menu-list">
        <TabLink activeTab={activeTab} onChange={onChange} tab='Sorting criteria' icon={faArrowDown19} />
        <TabLink activeTab={activeTab} onChange={onChange} tab='Matchmaking' icon={faMicrochip} />
      </ul>
    </aside>
  );
};

export default TournamentFormSideMenu;
