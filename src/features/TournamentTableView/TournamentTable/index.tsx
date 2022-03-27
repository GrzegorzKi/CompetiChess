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
import { useCallback, useMemo } from 'preact/hooks';

import { useAppSelector } from 'hooks/index';
import useContextMenuHandler from 'hooks/useContextMenuHandler';
import { PlayersState, selectConfiguration, selectViewOptions } from 'reducers/tournamentReducer';
import { getDataIndex } from 'utils/common';

import style from './style.scss';

import Tiebreaker, { tiebreakers } from '#/Tiebreaker/Tiebreaker';
import { Configuration, Player } from '#/types/Tournament';
import { computeRanks, getPlayers } from '#/utils/TournamentUtils';


function getPoints(player: Player, round: number): number {
  return player.scores[round].points;
}

interface IProps {
  players: PlayersState;
  idx: number;
  exactPlaces: boolean;
  tableRef: Ref<HTMLDivElement>;
  selectedRef?: Ref<HTMLTableRowElement>;
  onRowEnter: (index: number) => void;
  onRowSelect: (index: number) => void;
  onContextMenu: JSX.MouseEventHandler<HTMLElement>;
}

function sortPlayersByPoints(players: PlayersState, configuration: Configuration, round: number) {
  const playersToIter = getPlayers(players.index,
    players.orderById, players.orderByPosition, configuration.matchByRank);
  const { sortedPlayers } = computeRanks(playersToIter, configuration.tiebreakers, round + 1);

  return sortedPlayers;
}

function getPlaces(players: Player[], round: number, exactPlaces: boolean): string[] {
  if (exactPlaces) {
    return players.map((_, index) => (index + 1).toString());
  }

  // Otherwise, calculate ranges of places
  if (round < 0) {
    return [];
  }

  const breakpoints = players.reduceRight((breakpoint, player, index, _players) => {
    if (index > 0 && player.scores[round].points !== _players[index - 1].scores[round].points) {
      breakpoint.push(index + 1);
    }
    return breakpoint;
  }, [] as number[]);
  breakpoints.push(1);

  return breakpoints.reduceRight((places, breakpoint, index, array) => {
    const next = array[index - 1] ?? (players.length + 1);
    if (breakpoint === next - 1) {
      places.push(`${breakpoint}`);
    } else {
      places.push(`${breakpoint}-${next - 1}`);
    }
    for (let i = breakpoint + 1; i < next; ++i) {
      places.push('');
    }
    return places;
  }, [] as string[]);
}

function getTiebreakerHeaders(_tiebreakers: Tiebreaker[] | undefined) {
  if (!_tiebreakers) {
    return null;
  }

  return _tiebreakers.map(tb => {
    const tiebreaker = tiebreakers[tb];
    if (tb !== Tiebreaker.DIRECT_ENCOUNTER) {
      return <th style="width: 2.5rem; text-align: center;" key={tiebreaker.abbr}><abbr
        title={tiebreaker.name}>{tiebreaker.abbr}</abbr></th>;
    }
  });
}

function getTiebreakerValues(sortedPlayers: Player[], _tiebreakers: Tiebreaker[] | undefined, round: number) {
  if (!_tiebreakers) {
    return [];
  }

  return sortedPlayers.map(player => {
    return _tiebreakers.map(tb => {
      const tiebreaker = tiebreakers[tb];
      if (tb !== Tiebreaker.DIRECT_ENCOUNTER) {
        return <td key={tb}>{player.scores[round].tiebreakers[tb]?.toFixed(tiebreaker.decimalPlaces ?? 1)}</td>;
      }
    });
  });
}

const TournamentTable: FunctionalComponent<IProps> = (
  { tableRef, players, idx, exactPlaces, selectedRef, onRowEnter, onRowSelect, onContextMenu }) => {

  const { selectedRound: round } = useAppSelector(selectViewOptions);
  const configuration = useAppSelector(selectConfiguration);

  const handleDoubleClick = useCallback((event: JSX.TargetedMouseEvent<HTMLTableRowElement>) => {
    if (event.detail > 1 && event.button === 0 /* Main button */) {
      event.preventDefault();
      const index = getDataIndex(event.currentTarget);
      if (index !== undefined) {
        onRowEnter(index);
      }
    }
  }, [onRowEnter]);

  const handleKeyOnRow = useCallback((event: JSX.TargetedKeyboardEvent<HTMLElement>) => {
    if (['Enter', 'Space'].includes(event.code)) {
      event.preventDefault();
      const index = getDataIndex(event.currentTarget);
      if (index !== undefined) {
        onRowEnter(index);
      }
    }
  }, [onRowEnter]);

  const menuHandler = useContextMenuHandler(onContextMenu);
  const playersByPosition = players.orderByPosition.map(p => players.index[p]);

  const sortedPlayers = useMemo(() => configuration ? sortPlayersByPoints(players, configuration, round) : [],
    [configuration, players, round]);
  const places = useMemo(() => getPlaces(sortedPlayers, round, exactPlaces),
    [exactPlaces, round, sortedPlayers]);

  const tbHeaders = useMemo(() => getTiebreakerHeaders(configuration?.tiebreakers),
    [configuration?.tiebreakers]);
  const tbValues = useMemo(() => getTiebreakerValues(sortedPlayers, configuration?.tiebreakers, round),
    [configuration?.tiebreakers, round, sortedPlayers]);

  if (playersByPosition.length === 0 || !configuration) {
    return <div ref={tableRef} class="controls">No players currently in the tournament.</div>;
  } else if (round < 0) {
    return <div ref={tableRef} class="controls">No games played so far, nothing to display.</div>;
  }

  return (
    <div ref={tableRef}>
      <div class="print-only">
        CompetiChess - Tournament table after round {round + 1}
      </div>
      <table class='table is-striped is-hoverable is-fullwidth'>
        <thead class={style.fixedHead}>
          <tr>
            <th style="width: 5rem; text-align: center;">Place</th>
            <th style="width: 3rem; text-align: right;">No.</th>
            <th style="min-width: 10rem;">Player</th>
            <th style="width: 5rem;">Rating</th>
            <th style="width: 2.5rem;">Pts</th>
            {tbHeaders}
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) =>
            <tr key={player.id} data-index={player.id}
              onClick={() => onRowSelect(player.id)} onFocus={() => onRowSelect(player.id)}
              onMouseDown={handleDoubleClick} onKeyPress={handleKeyOnRow}
              onContextMenu={menuHandler}
              tabIndex={0}
              class={idx === player.id ? 'is-selected' : ''}
              ref={idx === player.id ? selectedRef : undefined}
            >
              <td style="text-align: center;">{places[index]}</td>
              <td style="text-align: right;">{player.id}</td>
              <td>{player.name}</td>
              <td>{player.rating}</td>
              <td>{getPoints(player, round).toFixed(1)}</td>
              {tbValues[index]}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TournamentTable;
