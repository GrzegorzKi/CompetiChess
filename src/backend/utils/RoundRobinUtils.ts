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

// Algorithm based on code posted by Soapstone at
// https://www.symbiosis.elementfx.com/projects/roundrobin2/RoundRobin.htm

type RRPair<T> = [T, T]
export type RoundRobinTable<T> = Array<Array<RRPair<T>>>
export type TableType = 'Standard' | 'Berger' | 'Crenshaw';

type ItemType<T> =
  T extends number ? number :
    T extends Array<infer U> ? U : never;

function getPlayersArray<T>(players: number | T[]): Array<ItemType<typeof players>> {
  if (typeof players === 'number') {
    return Array.from({ length: players }).map((_, i) => i);
  }
  return [...players];
}

/*
 * Algorithm starts by splitting field into two lines, reverse lower line.
 *
 * Standard fixes first item, rotates other items 1 position clockwise.
 * Berger instead fixes last item, rotates other items n/2 positions.
 * Crenshaw is Berger with rounds reversed.
 */
export function calculateTable<T>(
  players: number | T[],
  type: TableType,
  dummy?: T
): RoundRobinTable<ItemType<typeof players>> {
  const table = getPlayersArray(players);
  const skipFirst = table.length % 2 !== 0 && dummy === undefined;
  if (table.length % 2 !== 0) {
    if (type === 'Standard') {
      table.splice(0, 0, dummy ?? Object.create(null));
    } else {
      table.push(dummy ?? Object.create(null));
    }
  }

  const n = table.length;
  const rounds = n - 1;
  const half = n / 2;
  const schedule: RoundRobinTable<ItemType<typeof players>> = [];

  let top = table.slice(0, half);
  let bottom = table.slice(half, n);

  for (let i = 0; i < rounds; ++i) {
    schedule[i] = [];

    if (!skipFirst) {
      if (i % 2 === 0) {
        schedule[i].push([top[0], bottom[half - 1]]);
      } else {
        schedule[i].push([bottom[half - 1], top[0]]);
      }
    }

    for (let j = 1; j < half; ++j) {
      schedule[i].push([top[j], bottom[half - j - 1]]);
    }

    // Now we rotate
    if (type === 'Standard') {
      const addon = bottom.slice(-1); // Standard algorithm rotates the last player...
      top.splice(1, 0, addon[0]); // ...into the second position
      bottom.splice(0, 0, top.pop()!);
    } else {
      // Berger and Crenshaw rotate the field halfway around
      top.push(bottom.pop()!);
      bottom.push(top[0]);
      top = top.slice(1);
      // Swap top with bottom
      const tmp = top; top = bottom; bottom = tmp;
    }
  }
  if (type === 'Crenshaw') schedule.reverse();

  return schedule;
}

function flipPairing<T>(pairing: RRPair<T>): RRPair<T> {
  return [pairing[1], pairing[0]];
}

function flipRound<T>(round: Array<RRPair<T>>) {
  const tmpRound: Array<RRPair<T>> = [];
  for (let j = 0; j < round.length; ++j) {
    tmpRound.push(flipPairing(round[j]));
  }
  return tmpRound;
}

export function flipSchedule<T>(schedule: RoundRobinTable<T>): RoundRobinTable<T> {
  const tmpSchedule: RoundRobinTable<T> = [];
  for (let i = 0; i < schedule.length; ++i) {
    tmpSchedule.push(flipRound(tmpSchedule[i]));
  }
  return tmpSchedule;
}

export function multiplySchedule<T>(schedule: RoundRobinTable<T>,
  times: number): RoundRobinTable<T> {
  let newSchedule = schedule;
  for (let i = 1; i < times; ++i) {
    // Flip last two rounds to avoid playing the same color three times in a row
    newSchedule[newSchedule.length - 1] = flipRound(newSchedule[newSchedule.length - 1]);
    newSchedule[newSchedule.length - 2] = flipRound(newSchedule[newSchedule.length - 2]);
    if (i % 2 !== 0) {
      newSchedule = newSchedule.concat(flipSchedule(schedule));
    } else {
      newSchedule = newSchedule.concat(schedule);
    }
  }
  return newSchedule;
}

/*
 * Returns array of [round, pairNum] indices of 'schedule' if pairing
 * has been found or false otherwise.
 *
 * Use 'undefined' in pair to not search for particular color/player in pairing.
 * At least one object in pair must not be undefined.
 */
export function seekPairing<T>(
  schedule: RoundRobinTable<T>,
  pair: [T?, T?],
  startRow: number,
  endRow: number,
): [number, number] | false {
  const rounds = schedule.length;
  let from = startRow < 0 ? rounds + startRow : startRow;
  let to = endRow < 0 ? rounds + endRow : endRow;
  if (from > to) {
    const tmp = from; from = to; to = tmp;
  }

  for (let i = to; i >= from; --i) {
    for (let j = 0; j < schedule[i].length; ++j) {
      const pairing = schedule[i][j];
      if (pair[0] === pairing[0] && pair[1] === pairing[1]) return [i, j];
      if (pair[0] === pairing[0] && pair[1] === undefined) return [i, j];
      if (pair[0] === undefined && pair[1] === pairing[1]) return [i, j];
    }
  }
  return false;
}

type Dropout<T> = {
  dropout: T,
  atRound?: number
}

export function countColors<T>(
  schedule: RoundRobinTable<T>,
  { dropout, atRound = 0 }: Dropout<T>
): Map<T, [number, number]> {
  const playersMap = new Map<T, [number, number]>();

  for (let i = 0; i < schedule.length; ++i) {
    for (let j = 0; j < schedule[i].length; ++j) {
      const pair = schedule[i][j];

      if (i < atRound || (pair[0] !== dropout && pair[1] !== dropout)) {
        const p1 = playersMap.get(pair[0]) ?? [0, 0];
        p1[0] += 1;
        const p2 = playersMap.get(pair[1]) ?? [0, 0];
        p2[1] += 1;
        playersMap.set(pair[0], p1);
        playersMap.set(pair[1], p2);
      }
    }
  }

  return playersMap;
}

function seekTuple<T>(value: T, asTails: boolean): [T?, T?] {
  if (asTails) {
    return [undefined, value];
  }
  return [value, undefined];
}

function seekTuplePair<T>(value: [T, T], asTails: boolean): [T?, T?] {
  if (asTails) {
    return [undefined, value[0]];
  }
  return [value[1], undefined];
}

/*
 * Finds reversals for round-robin schedule, when one of players/teams drops out.
 *
 * Algorithm tries to match players with color difference higher than 2,
 * optionally trying to swap with players with color difference of 1.
 */
export function findReversals<T>(schedule: RoundRobinTable<T>, dropout: Dropout<T>)
  : Array<RRPair<T>> {
  const playersColors = countColors(schedule, dropout);

  const heads: T[] = [];
  const resHeads: T[] = [];
  const tails: T[] = [];
  const resTails: T[] = [];

  // This prevents re-using pairings
  const flipsUsed: Record<string, boolean> = Object.create(null);
  const reversals: Array<RRPair<T>> = [];

  // Find any imbalances between played colors
  playersColors.forEach((colors, key) => {
    if (colors[0] - colors[1] > 1) heads.push(key);
    else if (colors[0] - colors[1] === 1) resHeads.push(key);
    else if (colors[0] - colors[1] < -1) tails.push(key);
    else if (colors[0] - colors[1] === -1) resTails.push(key);
  });

  function isUsed(pair: RRPair<T>): boolean {
    return pair.toString() in flipsUsed;
  }

  function markAsUsed(pair: RRPair<T>): void {
    flipsUsed[pair.toString()] = true;
  }

  function addToReversals(...pairs: RRPair<T>[]): void {
    pairs.forEach((pair) => {
      markAsUsed(pair);
      reversals.push(flipPairing(pair));
    });
  }

  // Seek one-flips
  function seekOneFlips(swapArrays: boolean) {
    const firstSet = swapArrays ? tails : heads;
    const secondSet = swapArrays ? heads : tails;
    const resFirstSet = swapArrays ? resTails : resHeads;
    const resSecondSet = swapArrays ? resHeads : resTails;

    let i = 0;
    let j = 0;

    function internalSeekOneFlips() {
      for (j = 0; j < secondSet.length; ++j) {
        const p1 = seekPairing(schedule, [firstSet[i], secondSet[j]], -1, -3);
        if (p1 && !isUsed(schedule[p1[0]][p1[1]])) {
          addToReversals(schedule[p1[0]][p1[1]]);
          firstSet.splice(i, 1);
          secondSet.splice(j, 1);
          return true;
        }
      }
      for (j = 0; j < resSecondSet.length; ++j) {
        const p1 = seekPairing(schedule, [firstSet[i], resSecondSet[j]], -1, -3);
        if (p1 && !isUsed(schedule[p1[0]][p1[1]])) {
          addToReversals(schedule[p1[0]][p1[1]]);
          firstSet.splice(i, 1);
          resFirstSet.push(resTails[j]);
          resSecondSet.splice(j, 1);
          return true;
        }
      }
      return false;
    }

    while (i < firstSet.length) {
      const found = internalSeekOneFlips();

      if (!found) i += 1;
    }
  }

  // Seek two-flips:
  // Seek head/tail in ultimate round and the opposite in penultimate round.
  function seekTwoFlips(swapArrays: boolean) {
    const firstSet = swapArrays ? tails : heads;
    const secondSet = swapArrays ? heads : tails;
    const resFirstSet = swapArrays ? resTails : resHeads;
    const resSecondSet = swapArrays ? resHeads : resTails;
    let i = 0;
    let j = 0;

    function innerSeekTwoFlips(): boolean {
      const p1 = seekPairing(schedule, seekTuple(firstSet[i], swapArrays), -1, -1);
      if (p1 && !isUsed(schedule[p1[0]][p1[1]])) {
        const ultPair = schedule[p1[0]][p1[1]];
        const p2 = seekPairing(schedule, seekTuplePair(ultPair, swapArrays), -2, -2);
        if (p2 && !isUsed(schedule[p2[0]][p2[1]])) {
          const penPair = schedule[p2[0]][p2[1]];
          const value = swapArrays ? penPair[0] : penPair[1];
          for (j = 0; j < secondSet.length; ++j) {
            if (value === secondSet[j]) {
              addToReversals(ultPair, penPair);
              firstSet.splice(i, 1);
              secondSet.splice(j, 1);
              return true;
            }
          }
          for (j = 0; j < resSecondSet.length; ++j) {
            if (value === resSecondSet[j]) {
              addToReversals(ultPair, penPair);
              firstSet.splice(i, 1);
              resFirstSet.push(resSecondSet[j]);
              resSecondSet.splice(j, 1);
              return true;
            }
          }
        }
      }
      return false;
    }

    while (i < firstSet.length) {
      const found = innerSeekTwoFlips();

      if (!found) {
        i += 1;
      }
    }
  }

  // Seek three-flips:
  // Seek head or tail in ultimate round, middle in penultimate round
  // then branch to find the opposite in either ante- or ultimate again.
  function seekThreeFlips(swapArrays: boolean) {
    const firstSet = swapArrays ? tails : heads;
    const secondSet = swapArrays ? heads : tails;
    const resFirstSet = swapArrays ? resTails : resHeads;
    const resSecondSet = swapArrays ? resHeads : resTails;
    let i = 0;
    let j = 0;

    function innerSeekThreeFlips() {
      const p1 = seekPairing(schedule, seekTuple(firstSet[i], swapArrays), -1, -1);
      if (p1 && !isUsed(schedule[p1[0]][p1[1]])) {
        const ultPair = schedule[p1[0]][p1[1]];
        const p2 = seekPairing(schedule, seekTuplePair(ultPair, swapArrays), -2, -2);
        if (p2 && !isUsed(schedule[p2[0]][p2[1]])) {
          const penPair = schedule[p2[0]][p2[1]];

          // Branch to ante-penultimate or ultimate round
          for (let rOff = -3; rOff <= -1; rOff += 2) {
            const p3 = seekPairing(schedule, seekTuplePair(penPair, swapArrays), rOff, rOff);

            if (p3 && !isUsed(schedule[p3[0]][p3[1]])) {
              const thirdPair = schedule[p3[0]][p3[1]];
              const value = swapArrays ? thirdPair[0] : thirdPair[1];
              for (j = 0; j < secondSet.length; ++j) {
                if (value === secondSet[j]) {
                  addToReversals(ultPair, penPair, thirdPair);
                  firstSet.splice(i, 1);
                  secondSet.splice(j, 1);
                  return true;
                }
              }
              for (j = 0; j < resSecondSet.length; ++j) {
                if (value === resSecondSet[j]) {
                  addToReversals(ultPair, penPair);
                  firstSet.splice(i, 1);
                  resFirstSet.push(resSecondSet[j]);
                  resSecondSet.splice(j, 1);
                  return true;
                }
              }
            }
          }
        }
      }
      return false;
    }

    while (i < firstSet.length) {
      const found = innerSeekThreeFlips();

      if (!found) i += 1;
    }
  }

  seekOneFlips(false);
  seekOneFlips(true);
  seekTwoFlips(false);
  seekTwoFlips(true);
  seekThreeFlips(false);
  seekThreeFlips(true);

  return reversals;
}
