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

import { h, FunctionalComponent, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { useAppDispatch, useAppSelector } from 'hooks';
import useContextMenuHandler from 'hooks/useContextMenuHandler';
import useElementFocus from 'hooks/useElementFocus';
import {
  selectNextRound,
  selectPrevRound,
  selectRound,
  selectViewOptions,
  setResult,
} from 'reducers/tournamentReducer';

import { Pair, Player, PlayersRecord } from '#/types/Tournament';

import PaginateRound from '@/PaginateRound';

interface Props {
  roundPairs: Array<Pair[]>,
  players: PlayersRecord,
  forceRound?: number
}

function prevRoundPoints(player: Player, round: number): number {
  return (round <= 0)
    ? 0.0
    : player.scores[round - 1].points;
}

function getResult(pair: Pair, players: PlayersRecord, round: number) {
  const white = players[pair.white];
  const black = players[pair.black];
  return `${white.games[round].result} : ${black.games[round].result}`;
}

function displayPlayer(player: Player) {
  return `${player.name} (${player.id})`;
}

const PairsView: FunctionalComponent<Props> = ({ roundPairs, players, forceRound }) => {
  const { selectedRound: round } = useAppSelector(selectViewOptions);
  const dispatch = useAppDispatch();

  const [idx, setIdx] = useState(0);
  const [ref, setRef, focusOnNext, focusOnPrev, focusOnFirst] = useElementFocus<HTMLTableRowElement>({});

  const pairs: Pair[] = roundPairs[round];

  useEffect(() => {
    if (forceRound) {
      dispatch(selectRound(forceRound));
    }
  }, [dispatch, forceRound]);
  useEffect(() => {
    setIdx(1);
    if (ref.current === document.activeElement) {
      focusOnFirst();
    }
  }, [round, ref, focusOnFirst]);

  // Register keys handler
  useEffect(() => {
    const arrowHandling = (event: JSX.TargetedKeyboardEvent<any>) => {
      const pairNo: string | undefined = ref.current?.dataset['index'];

      switch (event.code) {
      case 'ArrowLeft':
        dispatch(selectPrevRound());
        break;
      case 'ArrowRight':
        dispatch(selectNextRound());
        break;
      case 'ArrowUp':
        focusOnPrev() && event.preventDefault();
        break;
      case 'ArrowDown':
        focusOnNext() && event.preventDefault();
        break;
      default:
        switch (event.key) {
        case 'w':
        case 'W':
        case '1':
          pairNo && dispatch(setResult({ pairNo, type: 'WHITE_WIN' }));
          event.shiftKey ? focusOnPrev() : focusOnNext();
          break;
        case 'l':
        case 'L':
        case '0':
          pairNo && dispatch(setResult({ pairNo, type: 'BLACK_WIN' }));
          event.shiftKey ? focusOnPrev() : focusOnNext();
          break;
        case 'd':
        case 'D':
        case '5':
          pairNo && dispatch(setResult({ pairNo, type: 'DRAW' }));
          event.shiftKey ? focusOnPrev() : focusOnNext();
          break;
        }
      }
    };

    document.addEventListener('keydown', arrowHandling);
    return () => document.removeEventListener('keydown', arrowHandling);
  }, [dispatch, focusOnNext, focusOnPrev, ref]);

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
      <PaginateRound pageCount={roundPairs.length}
                     page={round}
                     onPageChange={({ selected }) => dispatch(selectRound(selected))} />
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
                  ref={idx === pair.no ? setRef : undefined}
                  tabIndex={0}
              >
                <td>{pair.no}</td>
                <td>{prevRoundPoints(players[pair.white], round)
                  .toFixed(1)}</td>
                <td>{displayPlayer(players[pair.white])}</td>
                <td>{getResult(pair, players, round)}</td>
                <td>{displayPlayer(players[pair.black])}</td>
                <td>{prevRoundPoints(players[pair.black], round)
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
