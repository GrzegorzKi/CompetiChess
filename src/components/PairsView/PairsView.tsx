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
import { useCallback, useEffect, useState } from 'preact/hooks';

import { Pair } from '../../backend/Pairings/Pairings';
import TournamentData from '../../backend/types/TournamentData';
import { TrfPlayer } from '../../backend/types/TrfFileFormat';
import { useElementFocus } from '../../hooks/useElementFocus';
import PaginateRound from '../PaginateRound';

interface Props {
  data: TournamentData,
  forceRound?: number
}

function prevRoundPoints(player: TrfPlayer, round: number): number {
  return (round <= 0)
    ? 0.0
    : player.scores[round - 1].points;
}

function getResult(pair: Pair, round: number) {
  return `${pair.white.games[round].result} : ${pair.black.games[round].result}`;
}

const PairsView: FunctionalComponent<Props> = ({ data , forceRound }) => {
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState(forceRound || 0);
  const [ref, focusOnNext, focusOnPrev, focusOnFirst] = useElementFocus<HTMLTableRowElement>();

  const pairs: Pair[] = data.pairs[round];

  useEffect(() => {
    if (forceRound !== undefined) setRound(forceRound);
  }, [data, forceRound]);
  useEffect(() => {
    if (ref.current === document.activeElement) {
      focusOnFirst();
    } else {
      setIdx(1);
    }
  }, [round, ref, focusOnFirst]);

  const arrowHandling = useCallback((event: JSX.TargetedKeyboardEvent<any>) => {
    if (event.code === 'ArrowLeft') {
      if (round > 0) setRound(r => r - 1);
    } else if (event.code === 'ArrowRight') {
      if (round < data.playedRounds - 1) setRound(r => r + 1);
    } else if (event.code === 'ArrowUp') {
      if (idx > 1) {
        event.preventDefault();
        focusOnPrev();
      }
    } else if (event.code === 'ArrowDown') {
      if (idx < pairs.length) {
        event.preventDefault();
        focusOnNext();
      }
    }
  }, [idx, round, data.playedRounds, pairs, focusOnPrev, focusOnNext]);

  // Register keys handler
  useEffect(() => {
    document.addEventListener('keydown', arrowHandling);
    return () => document.removeEventListener('keydown', arrowHandling);
  }, [arrowHandling]);

  if (!pairs) {
    return <h2>No data found for round {round + 1}</h2>;
  }

  const selectRow = (event: JSX.TargetedEvent<HTMLElement>) => {
    const attribute = event.currentTarget.dataset['index'];
    if (attribute) {
      setIdx(+attribute);
    }
  };

  const enterRow = (event: JSX.TargetedEvent<HTMLElement>) => {
    const attribute = event.currentTarget.dataset['index'];
    if (attribute) {
      alert(`Selected pair no ${attribute}`);
    }
  };

  const handleDoubleClick = (event: JSX.TargetedMouseEvent<HTMLTableRowElement>) => {
    if (event.detail > 1) {
      event.preventDefault();
      enterRow(event);
    }
  };

  const handleKeyOnRow = (event: JSX.TargetedKeyboardEvent<HTMLElement>) => {
    if (['Enter', 'Space'].includes(event.code)) {
      event.preventDefault();
      enterRow(event);
    }
  };

  return (
    <>
      <PaginateRound pageCount={data.playedRounds}
                     page={round}
                     onPageChange={({ selected }) => setRound(selected)} />
      <div class='table-container'>
        <table class='table is-striped is-hoverable'>
          <caption>Data for round {round + 1}</caption>
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
                  onClick={selectRow} onFocus={selectRow}
                  onMouseDown={handleDoubleClick} onKeyPress={handleKeyOnRow}
                  class={idx === pair.no ? 'is-selected' : ''}
                  ref={idx === pair.no ? ref : undefined}
                  tabIndex={0}
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
