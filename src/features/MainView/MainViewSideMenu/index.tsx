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
import { FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';

import { routes } from 'utils/index';

import Burger from '@/Burger';
import SideMenu, { MenuNavLink } from '@/SideMenu';


const MainViewSideMenu: FunctionalComponent = () => {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(false);

  return (
    <SideMenu isActive={expanded}>
      <Burger isActive={expanded} onClick={() => setExpanded(s => !s)} />
      <p class="menu-label">{t('General')}</p>
      <ul class="menu-list">
        <MenuNavLink onClick={() => setExpanded(false)} to={routes.pairs.path} icon={faHandshake}>{t('Pairings')}</MenuNavLink>
        <MenuNavLink onClick={() => setExpanded(false)} to={routes.players.path} icon={faUsers}>{t('Players')}</MenuNavLink>
        <MenuNavLink onClick={() => setExpanded(false)} to={routes.tournamentTable.path} icon={faTableCells}>{t('Tournament table')}</MenuNavLink>
      </ul>
    </SideMenu>
  );
};

export default MainViewSideMenu;
