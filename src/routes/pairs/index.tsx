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
import { useLocation } from 'react-router';
import { Navigate } from 'react-router-dom';

import { useAppSelector } from 'hooks';
import { selectPairs, selectPlayers } from 'reducers/tournamentReducer';
import { routes } from 'utils';

import MainViewSideMenu from '@/MainViewSideMenu';
import NextRoundButton from '@/NextRoundButton';
import PairsView from '@/PairsView';
import { SectionWithSideMenu } from '@/SideMenu';

const Pairs: FunctionalComponent = () => {
  const pairs = useAppSelector(selectPairs);
  const players = useAppSelector(selectPlayers);
  const { pathname } = useLocation();

  if (!pairs || !players) {
    if (pathname === routes.pairs.path) {
      return <Navigate to={routes[''].path} replace />;
    }
    return null;
  }

  return (
    <>
      <MainViewSideMenu activeTab="Pairs" onChange={() => {/**/}} />
      <SectionWithSideMenu>
        <NextRoundButton><strong>Start next round</strong></NextRoundButton>
        <PairsView roundPairs={pairs} players={players.index} />
      </SectionWithSideMenu>
    </>
  );
};

export default Pairs;
