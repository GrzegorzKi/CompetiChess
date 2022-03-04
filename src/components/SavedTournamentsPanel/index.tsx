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

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { h } from 'preact';
import { useState } from 'preact/hooks';

import { useAppSelector } from 'hooks/index';
import useDebounce from 'hooks/useDebounce';
import { selectTournament } from 'reducers/tournamentReducer';

import PanelBlock, { NoResultsPanelBlock, NoTournamentsBlock } from './PanelBlock';
import style from './style.scss';

import ImportTournamentButton from '@/ImportTournamentButton';
import ImportTrfxTournamentButton from '@/ImportTrfxTournamentButton';

export type TournamentEntry = {
  id: string,
  name: string,
  created: number,
  updated?: number,
}

function getPanelBlocks(filteredEntries: TournamentEntry[], query: string, currentEntry?: TournamentEntry): JSX.Element {
  const currentPanelBlock = currentEntry
    ? <PanelBlock isActive key={currentEntry.id} {...currentEntry} />
    : null;

  const queriedEntries = filteredEntries.length > 0
    ? filteredEntries.map((entry) => <PanelBlock key={entry.id} {...entry} />)
    : (query
      ? <NoResultsPanelBlock query={query} />
      : null);

  if (!currentPanelBlock && !queriedEntries) {
    return <NoTournamentsBlock />;
  }

  return (<>
    {currentPanelBlock}
    {queriedEntries}
  </>);
}

const SavedTournamentsPanel = (): JSX.Element => {
  const tournament = useAppSelector(selectTournament);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  function filterByNameOrId(entry: TournamentEntry) {
    return entry.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      || entry.id.toLowerCase().includes(debouncedQuery.toLowerCase());
  }

  // TODO Read entries from LocalStorage
  const entries: TournamentEntry[] = [];
  const currentEntry = tournament
    ? {
      id: tournament.id,
      name: '-- Current --',
      created: tournament.createdDate
    }
    : undefined;

  const filteredEntries = entries.filter(filterByNameOrId);

  const panelBlocks = getPanelBlocks(filteredEntries, debouncedQuery, currentEntry);

  return (
    <article class={`panel is-primary ${style.panel}`}>
      <p class="panel-heading">
        Tournaments
      </p>
      <div class="panel-block">
        <p class="control has-icons-left">
          <span class="icon is-left">
            <Icon icon={faSearch} />
          </span>
          <input class="input is-primary" type="text"
                 value={query} onInput={(e) => setQuery(e.currentTarget.value)}
                 placeholder="Search" />
        </p>
      </div>
      <span className={style.controlButtons}>
        <button disabled class="button is-primary">Save tournament</button>
        <ImportTournamentButton />
        <ImportTrfxTournamentButton />
      </span>
      <p className="panel-tabs">
        <a className="is-active">All</a>
      </p>
      <section>
        {panelBlocks}
      </section>
    </article>
  );
};

export default SavedTournamentsPanel;
