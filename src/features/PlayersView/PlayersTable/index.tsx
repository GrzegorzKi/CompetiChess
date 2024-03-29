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
import { useTranslation } from 'react-i18next';

import useContextMenuHandler from 'hooks/useContextMenuHandler';
import { PlayersState } from 'reducers/tournamentReducer';
import { getDataIndex } from 'utils/common';

import style from './style.scss';

import PrintFooter from '@/PrintFooter';
import PrintHeader from '@/PrintHeader';


interface IProps {
  players: PlayersState;
  idx: number;
  tableRef: Ref<HTMLDivElement>;
  selectedRef?: Ref<HTMLTableRowElement>;
  onRowEnter: (index: number) => void;
  onRowSelect: (index: number) => void;
  onContextMenu: JSX.MouseEventHandler<HTMLElement>;
}

const PlayersTable: FunctionalComponent<IProps> = (
  { tableRef, players, idx, selectedRef, onRowEnter, onRowSelect, onContextMenu }) => {
  const { t } = useTranslation();

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

  if (playersByPosition.length === 0) {
    return <div ref={tableRef} class="controls">{t('No players')}&nbsp;<a onClick={() => onRowEnter(1)}>{t('Create player prompt')}</a></div>;
  }

  return (
    <div ref={tableRef}>
      <PrintHeader>
        <b>{t('Players list')}</b>
      </PrintHeader>
      <table class='table is-striped is-hoverable is-fullwidth'>
        <thead class={style.fixedHead}>
          <tr>
            <th style="width: 3rem; text-align: right;">{t('No.')}</th>
            <th style="min-width: 10rem;">{t('Player name')}</th>
            <th style="width: 7rem;">{t('Birth date')}</th>
            <th style="width: 5rem;">{t('Rating')}</th>
          </tr>
        </thead>
        <tbody>
          {playersByPosition.map((player) =>
            <tr key={player.id} data-index={player.id}
              onClick={() => onRowSelect(player.id)} onFocus={() => onRowSelect(player.id)}
              onMouseDown={handleDoubleClick} onKeyPress={handleKeyOnRow}
              onContextMenu={menuHandler}
              tabIndex={0}
              class={idx === player.id ? 'is-selected' : ''}
              ref={idx === player.id ? selectedRef : undefined}
            >
              <td style="text-align: right;">{player.id}</td>
              <td>{player.name}</td>
              <td>{player.birthDate}</td>
              <td>{player.rating}</td>
            </tr>
          )}
        </tbody>
      </table>
      <PrintFooter />
    </div>
  );
};

export default PlayersTable;
