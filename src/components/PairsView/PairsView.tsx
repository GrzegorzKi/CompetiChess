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

import { h, FunctionalComponent, Fragment, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { Pair } from '../../backend/Pairings/Pairings';
import TournamentData from '../../backend/types/TournamentData';
import { TrfPlayer } from '../../backend/types/TrfFileFormat';

interface Props {
  data: TournamentData,
  round: number
}

function prevRoundPoints(player: TrfPlayer, round: number): number {
  return (round <= 0)
    ? 0.0
    : player.scores[round - 1].points;
}

function getResult(pair: Pair, round: number) {
  return `${pair.white.games[round].result} : ${pair.black.games[round].result}`;
}

const PairsView: FunctionalComponent<Props> = ({ data, round }) => {
  const [selectedIdx, setSelectedIdx] = useState(-1);

  useEffect(() => {
    setSelectedIdx(-1);
  }, [data, round]);

  const pairsArr = data.pairs;
  if (round < 0 || round >= pairsArr.length) {
    return <h2>No data found for round {round + 1}</h2>;
  }

  const pairs: Pair[] = pairsArr[round];

  function handleSingleClick(event: JSX.TargetedMouseEvent<HTMLTableRowElement>) {
    const attribute = event.currentTarget.getAttribute('data-index');
    if (attribute) {
      setSelectedIdx(+attribute);
    }
  }

  function handleDoubleClick(event: JSX.TargetedMouseEvent<HTMLTableRowElement>) {
    if (event.detail > 1) {
      event.preventDefault();
      const attribute = event.currentTarget.getAttribute('data-index');
      if (attribute) {
        alert('You picked the wrong house, fool!');
      }
    }
  }

  return (
    <>
      <h2>Data for round {round + 1}</h2>
      <div class="table-container">
        <table class="table is-striped is-hoverable">
          <thead>
            <tr>
              <th>No.</th>
              <th>Pts</th>
              <th>First player</th>
              <th>Result</th>
              <th>Second player</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) =>
              <tr key={pair.no} data-index={pair.no}
                  onClick={handleSingleClick}
                  onMouseDown={handleDoubleClick}
                  class={selectedIdx === pair.no ? 'is-selected' : ''}
              >
                <td>{pair.no}</td>
                <td>{prevRoundPoints(pair.white, round)
                  .toFixed(1)}</td>
                <td>{pair.white.name} ({pair.white.playerId})</td>
                <td>{getResult(pair, round)}</td>
                <td>{pair.black.name} ({pair.black.playerId})</td>
                <td>{prevRoundPoints(pair.black, round)
                  .toFixed(1)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PairsView;
