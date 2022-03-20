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

import { faBook } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { FunctionalComponent, h } from 'preact';

import { TournamentEntry } from '..';
import DeleteTournamentButton from '../DeleteTournamentButton';
import ExportTournamentButton from '../ExportTournamentButton';
import LoadTournamentButton from '../LoadTournamentButton';
import SaveTournamentButton from '../SaveTournamentButton';

import style from './style.scss';

interface PanelBlockProps extends TournamentEntry {
  isActive?: true,
}

const PanelBlock: FunctionalComponent<PanelBlockProps> = ({ name, id, created, updated, isActive }) => {
  const createdDate = new Date(created).toLocaleString();
  const updatedDate = updated && new Date(updated).toLocaleString();

  return (
    <a tabIndex={0} class={`panel-block trans-bg ${style.panelBlock}${isActive ? ' is-active' : ''}`}>
      <span class="panel-icon">
        <Icon icon={faBook} />
      </span>
      <span style="margin-right: 0.25em">{name}</span>
      <span class={style.subText}>({id})</span>
      <span style="width: 100%" />
      <span class={style.subText} style="margin-right: 0.75em">Created:{' '}<strong>{createdDate}</strong></span>
      {updatedDate && <span class={style.subText}>Updated:{' '}<strong>{updatedDate}</strong></span>}
      <div class={style.panelButtons}>
        {isActive
          ? <SaveTournamentButton />
          : <LoadTournamentButton id={id} />}
        <ExportTournamentButton id={id} />
        <DeleteTournamentButton id={id} />
      </div>
    </a>
  );
};

export const NoResultsPanelBlock = ({ query }: { query: string }): JSX.Element => (
  <span class="panel-block">No results for search&nbsp;<b>{query}</b></span>
);

export const NoTournamentsBlock = (): JSX.Element => (
  <span class="panel-block">No tournaments saved</span>
);

export default PanelBlock;
