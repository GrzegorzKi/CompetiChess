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

import useContextMenuHandler from 'hooks/useContextMenuHandler';
import useElementFocus from 'hooks/useElementFocus';

import { Pair } from '#/Pairings/Pairings';
import Tournament, { Player } from '#/types/Tournament';

import PaginateRound from '@/PaginateRound';

interface Props {
  data: Tournament,
  forceRound?: number
}

function prevRoundPoints(player: Player, round: number): number {
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
    setIdx(1);
    if (ref.current === document.activeElement) {
      focusOnFirst();
    }
  }, [round, ref, focusOnFirst]);

  const arrowHandling = useCallback((event: JSX.TargetedKeyboardEvent<any>) => {
    switch (event.code) {
    case 'ArrowLeft':
      setRound(r => (r > 0) ? r - 1 : r);
      break;
    case 'ArrowRight':
      setRound(r => (r < data.playedRounds - 1) ? r + 1 : r);
      break;
    case 'ArrowUp':
      if (focusOnPrev()) {
        event.preventDefault();
      }
      break;
    case 'ArrowDown':
      if (focusOnNext()) {
        event.preventDefault();
      }
      break;
    }
  }, [data.playedRounds, focusOnPrev, focusOnNext]);

  // Register keys handler
  useEffect(() => {
    document.addEventListener('keydown', arrowHandling);
    return () => document.removeEventListener('keydown', arrowHandling);
  }, [arrowHandling]);

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

  const handleContextMenu = useContextMenuHandler<HTMLTableRowElement>((event) => {
    selectRow(event);
    // TODO Display custom context menu. Check if it's active and discard event otherwise
  });

  if (!pairs) {
    return <h2>No data found for round {round + 1}</h2>;
  }

  const handleDoubleClick = (event: JSX.TargetedMouseEvent<HTMLTableRowElement>) => {
    if (event.detail > 1 && event.button === 0 /* Main button */) {
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
                  onContextMenu={handleContextMenu}
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
