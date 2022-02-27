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
import { Link } from 'react-router-dom';

import { useAppSelector } from 'hooks';
import { selectPairs, selectPlayers, selectTournament } from 'reducers/tournamentReducer';

import NextRoundButton from '@/NextRoundButton';
import PairsView from '@/PairsView';

const Pairs: FunctionalComponent = () => {
  const tournament = useAppSelector(selectTournament);
  const pairs = useAppSelector(selectPairs);
  const players = useAppSelector(selectPlayers);

  return (
    tournament && pairs && players
      ? (
        <>
          <NextRoundButton><strong>Start next round</strong></NextRoundButton>
          <PairsView data={tournament} roundPairs={pairs} players={players.index} />
        </>
      )
      :
      <p>There is no tournament open right now.
        {' '}
        <Link className="has-text-link" to="/create">Do you want to create one?</Link>
      </p>
  );
};

export default Pairs;
