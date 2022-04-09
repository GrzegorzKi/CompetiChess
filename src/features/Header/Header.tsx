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
import { useEffect, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';

import { useAppSelector } from 'hooks';
import { selectTournament } from 'reducers/tournamentReducer';
import { routes } from 'utils';

import NavigationLinks from './NavigationLinks';
import style from './style.scss';

import Burger from '@/Burger';

const Header: FunctionalComponent = () => {
  const { t } = useTranslation();

  const [active, setActive] = useState(false);
  const tournament = useAppSelector(selectTournament);

  useEffect(() => {
    const hideNavOnOutsideClick = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        if (e.target.closest('.navbar') === null || e.target.classList.contains('navbar-item')) {
          setActive(false);
        }
      }
    };

    document.addEventListener('click', hideNavOnOutsideClick);
    return () => {
      document.removeEventListener('click', hideNavOnOutsideClick);
    };
  }, []);

  const tournamentInfo = tournament
    ? (
      <Link className={`navbar-item ${style.name}`} to={tournament ? routes.pairs.path : routes[''].path}>
        <b>{tournament.tournamentName}</b>
      </Link>
    ) : null;

  const tournamentSettings = tournament
    ? (
      <NavLink className={({ isActive }) => `navbar-item${isActive ? ' is-active' : ''}`} to={routes.tournamentSettings.path}>
        {t('Settings')}
      </NavLink>
    ) : null;

  return (
    <nav class="navbar is-fixed-top has-shadow" role="navigation" aria-label={t('Navigation bar')}>
      <div class="navbar-brand">
        <NavigationLinks />
        <Link className="navbar-item" to={tournament ? routes.pairs.path : routes[''].path}>
          <strong>CompetiChess</strong>
        </Link>
        <Burger isActive={active} onClick={() => setActive(!active)} />
      </div>

      <div class={`navbar-menu${active ? ' is-active' : ''}`} >
        <div class="navbar-end">
          {tournamentInfo}
          <NavLink className={({ isActive }) => `navbar-item${isActive ? ' is-active' : ''}`} to={routes.about.path}>
            {t('About')}
          </NavLink>
          <NavLink className={({ isActive }) => `navbar-item${isActive ? ' is-active' : ''}`} to={routes.tournaments.path}>
            {t('Manage tournaments')}
          </NavLink>
          {tournamentSettings}
        </div>
      </div>
    </nav>
  );
};

export default Header;
