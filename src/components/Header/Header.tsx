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
import { useLocation } from 'react-router';
import { Link, NavLink } from 'react-router-dom';

import { useAppSelector } from 'hooks';
import { selectTournament } from 'reducers/tournamentReducer';
import { routes } from 'utils';

import Burger from '@/Burger';
import NavigationLinks from '@/NavigationLinks';

const Header: FunctionalComponent = () => {
  const [active, setActive] = useState(false);
  const { pathname } = useLocation();
  const tournament = useAppSelector(selectTournament);

  useEffect(() => {
    const hideNavOnOutsideClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest('.navbar') === null) {
        setActive(false);
      }
    };

    document.addEventListener('click', hideNavOnOutsideClick);
    return () => {
      document.removeEventListener('click', hideNavOnOutsideClick);
    };
  }, []);
  useEffect(() => setActive(false), [pathname]);

  const tournamentInfo = tournament
    ? <span class="navbar-item"><b>{tournament.tournamentName}</b></span>
    : null;

  const tournamentSettings = tournament
    ? <NavLink className={({ isActive }) => `navbar-item${isActive ? ' is-active' : ''}`} to={routes.manageTournament.path}>Settings</NavLink>
    : null;

  return (
    <nav class="navbar is-fixed-top has-shadow" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <NavigationLinks />
        <Link className="navbar-item" to={routes[''].path}>
          <strong>CompetiChess</strong>
        </Link>
        <Burger isActive={active} onClick={() => setActive(!active)} />
      </div>

      <div class={`navbar-menu${active ? ' is-active' : ''}`} >
        <div class="navbar-end">
          {tournamentInfo}
          <NavLink className={({ isActive }) => `navbar-item${isActive ? ' is-active' : ''}`} to={routes.tournaments.path}>Manage tournaments</NavLink>
          {tournamentSettings}
        </div>
      </div>
    </nav>
  );
};

export default Header;
