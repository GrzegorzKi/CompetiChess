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

import { faChevronLeft, faChevronRight, faHouse } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useLocation } from 'react-router';
import { useNavigate, Link, NavLink } from 'react-router-dom';

import { useAppSelector } from 'hooks';
import { selectTournament } from 'reducers/tournamentReducer';
import { routes } from 'utils';
import { isInStandaloneMode } from 'utils/common';

import Burger from '@/Burger';

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

  const standaloneMode = isInStandaloneMode();
  const navigate = useNavigate();

  const navigationLinks = standaloneMode
    ? <>
      <a role="navigation" aria-label="Go back" class="navbar-item" onClick={() => history.back()}>
        <Icon icon={faChevronLeft} />
      </a>
      <a role="navigation" aria-label="Go forward" class="navbar-item" onClick={() => history.forward()}>
        <Icon icon={faChevronRight} />
      </a>
      <a role="navigation" aria-label="Go to home page" class="navbar-item" onClick={() => {
        if (history.length > 1) {
          history.go(-(history.length - 1));
        }
        navigate(routes[''].path, { replace: true });
      }}><Icon icon={faHouse} /></a>
    </>
    : null;

  return (
    <nav class="navbar is-fixed-top has-shadow" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        {navigationLinks}
        <Link className="navbar-item" to={routes[''].path}>
          <strong>CompetiChess</strong>
        </Link>
        <Burger isActive={active} onClick={() => setActive(!active)} />
      </div>

      <div class={`navbar-menu${active ? ' is-active' : ''}`} >
        <div class="navbar-end">
          {tournamentInfo}
          <NavLink className={({ isActive }) => `navbar-item${isActive ? ' is-active' : ''}`} to={routes.tournaments.path}>Tournaments</NavLink>
          <NavLink className={({ isActive }) => `navbar-item${isActive ? ' is-active' : ''}`} to={routes.pairs.path}>Pairs</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Header;
