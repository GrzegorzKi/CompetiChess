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

import { TournamentState } from 'reducers/tournamentReducer';

export const tournamentKeyPrefix = 'competichess:tournament-';

export function parseJSON<T>(value: string | null): T | undefined {
  try {
    return (value === null || value === 'undefined') ? undefined : JSON.parse(value);
  } catch {
    return undefined;
  }
}

export function readFromLocalStorage(key: string): string | null | undefined {
  if (typeof window === 'undefined') {
    console.warn(`Tried reading localStorage key "${key}" in non-client environment`);
    return undefined;
  }

  return window.localStorage.getItem(key);
}

export function readTournamentJsonFromLocalStorage(id: string): string | undefined {
  const item = readFromLocalStorage(tournamentKeyPrefix + id);
  return item ?? undefined;
}

export function saveToLocalStorage<T>(value: T, key: string): void {
  if (typeof window == 'undefined') {
    console.warn(`Tried setting localStorage key "${key}" in non-client environment`);
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function saveTournamentToLocalStorage(tournament: TournamentState): boolean {
  if (tournament.tournament?.id) {
    saveToLocalStorage(tournament, tournamentKeyPrefix + tournament.tournament.id);
    return true;
  }

  return false;
}


