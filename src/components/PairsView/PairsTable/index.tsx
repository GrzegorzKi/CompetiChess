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

import { FunctionalComponent, h, JSX, Ref } from 'preact';
import { useCallback } from 'preact/hooks';

import useContextMenuHandler from 'hooks/useContextMenuHandler';

import { getPairNo } from '../PairsView';

import { Pair, Player, PlayersRecord } from '#/types/Tournament';

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

interface IProps {
  pairs: Pair[] | undefined;
  players: PlayersRecord;
  idx: number;
  selectedRef?: Ref<HTMLTableRowElement>;
  onRowEnter: (index: number) => void;
  onRowSelect: (index: number) => void;
  onContextMenu: JSX.MouseEventHandler<HTMLElement>;
}

const PairsTable: FunctionalComponent<IProps> = (
  { pairs, players, idx, selectedRef, onRowEnter, onRowSelect, onContextMenu }) => {

  const handleDoubleClick = useCallback((event: JSX.TargetedMouseEvent<HTMLTableRowElement>) => {
    if (event.detail > 1 && event.button === 0 /* Main button */) {
      event.preventDefault();
      const index = getPairNo(event.currentTarget);
      if (index !== undefined) {
        onRowEnter(index);
      }
    }
  }, [onRowEnter]);

  const handleKeyOnRow = useCallback((event: JSX.TargetedKeyboardEvent<HTMLElement>) => {
    if (['Enter', 'Space'].includes(event.code)) {
      event.preventDefault();
      const index = getPairNo(event.currentTarget);
      if (index !== undefined) {
        onRowEnter(index);
      }
    }
  }, [onRowEnter]);

  const menuHandler = useContextMenuHandler(onContextMenu);

  if (!pairs || pairs.length === 0) {
    return <div>No pairs defined for selected round</div>;
  }

  const round = pairs[0].round - 1;

  return (
    <table className='table is-striped is-hoverable'>
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
              onClick={() => onRowSelect(pair.no)} onFocus={() => onRowSelect(pair.no)}
              onMouseDown={handleDoubleClick} onKeyPress={handleKeyOnRow}
              onContextMenu={menuHandler}
              tabIndex={0}
              className={idx === pair.no ? 'is-selected' : ''}
              ref={idx === pair.no ? selectedRef : undefined}
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
  );
};

export default PairsTable;