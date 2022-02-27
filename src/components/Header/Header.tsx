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
import { Link, useLocation } from 'wouter-preact';

import { useAppSelector } from 'hooks';
import { selectTournament } from 'reducers/tournamentReducer';

import { routes } from '../../constants';

import style from './style.scss';

const Header: FunctionalComponent = () => {
  const [location] = useLocation();
  const tournament = useAppSelector(selectTournament);

  return (
    <header class={style.header}>
      <Link href={routes[''].path}>
        <a><h1>Preact App</h1></a>
      </Link>
      <nav>
        {tournament ?
          <Link href={routes[''].path}>
            Tournament: <strong>{tournament.tournamentName}</strong>
          </Link>
          : null}
        <Link class={location === routes.create.path ? style.active : undefined} href={routes.create.path}>Create a tournament</Link>
        <Link class={location === routes.pairs.path ? style.active : undefined} href={routes.pairs.path}>Pairs</Link>
      </nav>
    </header>
  );
};

export default Header;
