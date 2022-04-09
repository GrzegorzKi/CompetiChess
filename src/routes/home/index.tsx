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
import { Trans } from 'react-i18next';
import { useLocation } from 'react-router';
import { Link, Navigate } from 'react-router-dom';

import { useAppSelector } from 'hooks/index';
import { selectTournament } from 'reducers/tournamentReducer';
import { routes } from 'utils/index';

const Home: FunctionalComponent = () => {
  const tournament = useAppSelector(selectTournament);
  const { pathname } = useLocation();

  if (tournament) {
    if (pathname === routes[''].path) {
      return <Navigate to={routes.pairs.path} replace />;
    }
    return null;
  }

  return (
    <p>
      <Trans i18nKey="No tournament active">
        There is no tournament active right now.
        {' '}
        <Link className="has-text-link" to={routes.tournaments.path}>Go to tournaments management</Link>.
      </Trans>
    </p>
  );};

export default Home;
