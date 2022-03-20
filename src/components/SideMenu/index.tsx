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

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { FunctionalComponent, h } from 'preact';
import { NavLink } from 'react-router-dom';

import style from './style.scss';

interface ISectionWithSideMenuProps {
  className?: string;
}

export const SectionWithSideMenu: FunctionalComponent<ISectionWithSideMenuProps> = ({ className, children }) => {
  const _class = className ? ` ${className}` : '';

  return <div class={`${style.hasSideMenu}${_class}`}>
    {children}
  </div>;
};

export interface ITabLinkProps<T extends string = string> {
  tab: T;
  activeTab: T;
  onChange: (value: T) => void;
  icon?: IconDefinition;
}

export function TabLink<T extends string = string>({ activeTab, onChange, tab, icon }: ITabLinkProps<T>): JSX.Element {
  return (
    <li>
      <a class={`is-unselectable${activeTab === tab ? ' is-active' : ''}`} onClick={() => onChange(tab)}>
        {icon && <span class="icon"><Icon icon={icon} /></span>}
        <span class={style.sideNavText}>{tab}</span>
      </a>
    </li>
  );
}

export interface IMenuNavLinkProps<T extends string = string> {
  to: string;
  tab: T;
  icon?: IconDefinition;
  onClick?: () => void;
}

export function MenuNavLink<T extends string = string>({ tab, to, icon, onClick }: IMenuNavLinkProps<T>): JSX.Element {
  return (
    <li>
      <NavLink onClick={onClick} className={({ isActive }) => `is-unselectable${isActive ? ' is-active' : ''}`} to={to}>
        {icon && <span class="icon"><Icon icon={icon} /></span>}
        <span class={style.sideNavText}>{tab}</span>
      </NavLink>
    </li>
  );
}

export interface ISideMenuProps {
  isActive: boolean;
}

const SideMenu: FunctionalComponent<ISideMenuProps> = ({ isActive, children }) => {
  const isActiveClass = isActive ? style.isActive : '';

  return (
    <aside class={`menu ${style.sideNav} ${isActiveClass}`}>
      {children}
    </aside>
  );
};

export default SideMenu;
