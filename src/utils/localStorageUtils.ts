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

import { TournamentEntry } from 'features/SavedTournamentsPanel';
import { clearIsModified } from 'reducers/globalReducer';
import { TournamentState } from 'reducers/tournamentReducer';

import Tournament from '#/types/Tournament';
import { RootState, store } from '@/store';

export const tournamentKeyPrefix = 'competichess:tournament-';
export const tournamentsIndexKey = 'competichess:tournaments';

export function parseJSON<T>(value: string | null): T | undefined {
  try {
    return (value === null || value === 'undefined') ? undefined : JSON.parse(value);
  } catch (e) {
    return undefined;
  }
}

export function readRawFromLocalStorage(key: string): string | null | undefined {
  if (typeof window === 'undefined') {
    // eslint-disable-next-line no-console
    console.warn(`Tried reading localStorage key "${key}" in non-client environment`);
    return undefined;
  }

  return window.localStorage.getItem(key);
}

export function readFromLocalStorage<T>(key: string): T | null | undefined {
  const item = readRawFromLocalStorage(key);

  return (item !== undefined && item !== null) ? parseJSON<T>(item) : item;
}

export function readTournamentJsonFromLocalStorage(id: string): string | undefined {
  const item = readRawFromLocalStorage(tournamentKeyPrefix + id);
  return item ?? undefined;
}

export function saveToLocalStorage<T>(value: T, key: string): T {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  } else {
    // eslint-disable-next-line no-console
    console.warn(`Tried setting localStorage key "${key}" in non-client environment`);
  }

  return value;
}

function saveTournamentIndex(index: TournamentEntry[]) {
  return saveToLocalStorage<TournamentEntry[]>(index, tournamentsIndexKey);
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(key);
  } else {
    // eslint-disable-next-line no-console
    console.warn(`Tried removing localStorage key "${key}" in non-client environment`);
  }
}

export function readTournamentIndex() {
  return readFromLocalStorage<TournamentEntry[]>(tournamentsIndexKey);
}

type UpdateTournamentsIndexProps =
  | { update: Tournament }
  | { remove: string }

function updateTournamentsIndex(params: UpdateTournamentsIndexProps) {
  let index = readTournamentIndex();
  if (!index) {
    index = saveTournamentIndex([]);
  }

  if ('update' in params) {
    const { id, tournamentName, createdDate } = params.update;
    const found = index.find(entry => entry.id === id);
    if (found) {
      found.name = tournamentName;
      found.updated = Date.now();
    } else {
      index.push({
        id,
        name: tournamentName,
        created: createdDate,
        updated: Date.now(),
      });
    }
    saveTournamentIndex(index);
  } else {
    index = index.filter(entry => entry.id !== params.remove);
    saveTournamentIndex(index);
  }

  // We dispatch a custom event so every useLocalStorage hook are notified
  // See: usehooks-ts useLocalStorage
  window.dispatchEvent(new Event('local-storage'));
}

export function saveTournamentToLocalStorage(tournament: TournamentState): boolean {
  if (tournament.tournament?.id) {
    const key = tournamentKeyPrefix + tournament.tournament.id;
    saveToLocalStorage(tournament, key);
    updateTournamentsIndex({ update: tournament.tournament });
    return true;
  }

  return false;
}

export function removeTournamentFromLocalStorage(id: string): void {
  removeFromLocalStorage(tournamentKeyPrefix + id);
  updateTournamentsIndex({ remove: id });
}

export function saveTournamentUnlessNotPersisted(): void {
  const { tournament } = store.getState() as RootState;
  const entries = readTournamentIndex() ?? [];

  const id = tournament.tournament?.id;

  for (const entry of entries) {
    if (id === entry.id) {
      saveTournamentToLocalStorage(tournament);
      store.dispatch(clearIsModified());
      break;
    }
  }
}
