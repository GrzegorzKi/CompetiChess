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

import Sorter from '#/types/Sorter';
import { Player } from '#/types/Tournament';
import { createComparator, PlayerComparator, shuffle } from '#/utils/SortUtils';


const sortByFideRating: PlayerComparator = (a, b) => b.rating - a.rating;
const sortByName: PlayerComparator = (a, b) => a.name.localeCompare(b.name);
const sortByFederation: PlayerComparator = (a, b) => a.federation.localeCompare(b.federation);

export type SorterInfo = {
  name: string;
  sort: PlayerComparator;
}

export const sorters: Record<Sorter, SorterInfo> = {
  [Sorter.FIDE_Rating]: {
    name: 'FIDE Rating',
    sort: sortByFideRating,
  },
  [Sorter.Name]: {
    name: 'Player name',
    sort: sortByName,
  },
  [Sorter.Federation]: {
    name: 'Federation',
    sort: sortByFederation,
  },
};

export const sortPlayersBySorters = (players: Player[], sorterList: Sorter[], shuffleEqual = false): Player[] => {
  const sortedPlayers = players.slice();

  // Perform shuffling first, so we can achieve stable sorting
  if (shuffleEqual) {
    shuffle(sortedPlayers);
  }

  const comparators = sorterList.map(s => sorters[s].sort);
  sortedPlayers.sort(createComparator(comparators, true));

  return sortedPlayers;
};
