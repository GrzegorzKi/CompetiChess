/*
 * Copyright (c) 2021-2022  Grzegorz Kita
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

import { compareHeadToHead } from '#/Tiebreaker/Tiebreaker';
import Tiebreaker from '#/types/Tiebreaker';
import { Player } from '#/types/Tournament';

export type PlayerComparator = (first: Player, second: Player) => number;

export function createComparator(compareFuncs: PlayerComparator[], ignoreRank?: boolean) {
  return (a: Player, b: Player): number => {
    for (const compareFunc of compareFuncs) {
      const result = compareFunc(a, b);
      if (result !== 0) {
        return result;
      }
    }

    // If they are equal, compare positional ranks unless preserveOrder is true
    return ignoreRank === true
      ? 0
      : a.rank - b.rank;
  };
}

// Sorts players by score in descending order
export function sortByScore(round: number): PlayerComparator {
  if (round < 1) {
    return () => 0;
  }
  return (first: Player, second: Player): number => {
    const firstScore = first.scores[round - 1]?.points ?? 0;
    const secondScore = second.scores[round - 1]?.points ?? 0;
    return secondScore - firstScore;
  };
}

export function sortByRank(first: Player, second: Player): number {
  return first.rank - second.rank;
}

// Sorts players by selected tie-breaker in descending order
export function sortByTiebreaker(round: number, tiebreaker: Tiebreaker): PlayerComparator {
  if (tiebreaker === Tiebreaker.DIRECT_ENCOUNTER) {
    return compareHeadToHead;
  }
  return (first: Player, second: Player): number => {
    const firstScore = first.scores[round - 1]?.tiebreakers[tiebreaker] ?? 0;
    const secondScore = second.scores[round - 1]?.tiebreakers[tiebreaker] ?? 0;
    return secondScore - firstScore;
  };
}

/**
 Fisher-Yates shuffle method.
 Sorts the elements of an array *in-place* and returns the sorted array.
 More information here: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle

 Shuffle visualization: https://bost.ocks.org/mike/shuffle/
 */
export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let randomIndex: number;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function numberComparator(first: number, second: number): number {
  return first - second;
}
