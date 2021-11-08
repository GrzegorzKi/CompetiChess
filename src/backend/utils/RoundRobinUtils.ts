// Algorithm based on code posted by Soapstone at
// https://www.symbiosis.elementfx.com/projects/roundrobin2/RoundRobin.htm

type RRPair = [number, number]
export type RoundRobinTable = Array<Array<RRPair>>
export type TableType = 'Standard' | 'Berger' | 'Crenshaw';

// Algorithm starts by splitting field into two lines, processing lower line in reverse.
// Standard fixes first item, rotates other items 1 position clockwise.
// Berger instead fixes last item, rotates other items n/2 positions.
// Crenshaw is Berger with rounds reversed.
export function calculateTable(
  players: number,
  type: TableType,
  dummy?: number
): RoundRobinTable {
  const table = Array.from({ length: players }).map((_, i) => i);
  const skipFirst = table.length % 2 !== 0 && dummy === undefined;
  if (table.length % 2 !== 0) {
    if (type === 'Standard') {
      table.splice(0, 0, dummy ?? -1);
    } else {
      table.push(dummy ?? -1);
    }
  }

  const n = table.length;
  const rounds = n - 1;
  const half = n / 2;
  const schedule: RoundRobinTable = [];

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
      const addon = bottom.pop()!; // Standard algorithm rotates the last player...
      top.splice(1, 0, addon); // ...into the second position
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

function flipPairing(pairing: RRPair): RRPair {
  return [pairing[1], pairing[0]];
}

export function flipSchedule(schedule: RoundRobinTable): RoundRobinTable {
  const tmpSchedule: RoundRobinTable = [];
  for (let i = 0; i < schedule.length; ++i) {
    tmpSchedule[i] = [];
    for (let j = 0; j < schedule[i].length; ++j) {
      tmpSchedule[i].push(flipPairing(schedule[i][j]));
    }
  }
  return tmpSchedule;
}

export function doubleSchedule(schedule: RoundRobinTable): RoundRobinTable {
  return schedule.concat(flipSchedule(schedule));
}

// Returns array of [round, pairNum] indices of 'schedule' if pairing
// has been found or false otherwise.
//
// Use -1 to not search for particular color/player in pairing.
export function seekPairing(
  schedule: RoundRobinTable,
  pair: [number?, number?],
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

type Dropout = {
  dropout: number,
  atRound?: number
}

export type ColorCount = {
  whites: Array<number>,
  blacks: Array<number>,
  affected: Array<RRPair>,
}
export function countColors(
  schedule: RoundRobinTable,
  { dropout, atRound = 0 }: Dropout
): ColorCount {
  const prsPerRound = schedule[0].length;
  const size = Math.max(schedule.length, prsPerRound * 2);
  const whites = new Array<number>(size);
  const blacks = new Array<number>(size);
  whites.fill(0);
  blacks.fill(0);
  const affected: RRPair[] = [];
  for (let i = 0; i < schedule.length; ++i) {
    for (let j = 0; j < prsPerRound; ++j) {
      const pair = schedule[i][j];
      if (i < atRound || (pair[0] !== dropout && pair[1] !== dropout)) {
        whites[pair[0]] += 1;
        blacks[pair[1]] += 1;
      } else {
        affected.push(pair);
      }
    }
  }

  return { whites, blacks, affected };
}

function seekTuple(value: number, asTails: boolean): [number?, number?] {
  if (asTails) {
    return [undefined, value];
  }
  return [value, undefined];
}

function seekTuplePair(value: [number, number], asTails: boolean): [number?, number?] {
  if (asTails) {
    return [undefined, value[0]];
  }
  return [value[1], undefined];
}

export function findReversals(schedule: RoundRobinTable, dropout: Dropout): Array<RRPair> {
  const rounds = schedule.length;
  const size = Math.max(rounds, schedule[0].length * 2);
  // Should not analyze when there are odd number of players
  if (size % 2 !== 0) {
    return [];
  }

  const { whites, blacks } = countColors(schedule, dropout);

  const heads: number[] = [];
  const tails: number[] = [];

  // Find new imbalances after the player has been excluded
  for (let i = 0; i < size; ++i) {
    if (whites[i] > blacks[i]) heads.push(i);
    if (whites[i] < blacks[i]) tails.push(i);
  }

  // This prevents re-using pairings
  const flipsUsed: Record<string, boolean> = Object.create(null);
  const reversals: Array<RRPair> = [];

  function isUsed(pair: RRPair): boolean {
    return pair.toString() in flipsUsed;
  }
  function markAsUsed(pair: RRPair): void {
    flipsUsed[pair.toString()] = true;
  }

  // Seek one-flips
  function seekOneFlips() {
    let hIdx = 0;
    while (hIdx < heads.length) {
      for (let tIdx = 0; tIdx < tails.length; ++tIdx) {
        const p1 = seekPairing(schedule, [heads[hIdx], tails[tIdx]], -1, -3);
        if (p1 && !isUsed(schedule[p1[0]][p1[1]])) {
          const pairing = schedule[p1[0]][p1[1]];

          markAsUsed(pairing);

          tails.splice(tIdx, 1);
          heads.splice(hIdx, 1);
          reversals.push(flipPairing(pairing));

          // Decrementing, as heads array has been cut
          hIdx -= 1;
          break;
        }
      }

      hIdx += 1;
    }
  }

  // Seek two-flips:
  // For now, only seeking tail in ultimate round and head in penultimate round
  function seekTwoFlips(swapArrays: boolean) {
    const firstSet = swapArrays ? tails : heads;
    const secondSet = swapArrays ? heads : tails;

    let i = 0;
    while (i < firstSet.length) {
      const p1 = seekPairing(schedule, seekTuple(firstSet[i], swapArrays), -1, -1);
      if (p1 && !isUsed(schedule[p1[0]][p1[1]])) {
        const ultPair = schedule[p1[0]][p1[1]];
        const p2 = seekPairing(schedule, seekTuplePair(ultPair, swapArrays), -2, -2);
        if (p2 && !isUsed(schedule[p2[0]][p2[1]])) {
          const penPair = schedule[p2[0]][p2[1]];
          const value = swapArrays ? penPair[0] : penPair[1];
          for (let j = 0; j < secondSet.length; ++j) {
            if (value === secondSet[j]) {
              markAsUsed(ultPair);
              markAsUsed(penPair);
              firstSet.splice(i, 1);
              secondSet.splice(j, 1);

              reversals.push(flipPairing(ultPair));
              reversals.push(flipPairing(penPair));

              i -= 1;
              break;
            }
          }
        }
      }

      i += 1;
    }
  }

  // Seek three-flips:
  // For now, seek head in ultimate round, middle in penultimate round
  // then branch to find tail in either ante- or ultimate again
  function seekThreeFlips(swapArrays: boolean) {
    const firstSet = swapArrays ? tails : heads;
    const secondSet = swapArrays ? heads : tails;

    let i = 0;
    while (i < firstSet.length) {
      const p1 = seekPairing(schedule, seekTuple(firstSet[i], swapArrays), -1, -1);
      if (p1 && !isUsed(schedule[p1[0]][p1[1]])) {
        const ultPair = schedule[p1[0]][p1[1]];
        const p2 = seekPairing(schedule, seekTuplePair(ultPair, swapArrays), -2, -2);
        if (p2 && !isUsed(schedule[p2[0]][p2[1]])) {
          const penPair = schedule[p2[0]][p2[1]];

          // Branch to ante-penultimate or ultimate round
          let found = false;
          for (let rOff = -3; rOff <= -1; rOff += 2) {
            if (found) break;
            const p3 = seekPairing(schedule, seekTuplePair(penPair, swapArrays), rOff, rOff);

            if (p3 && !isUsed(schedule[p3[0]][p3[1]])) {
              const thirdPair = schedule[p3[0]][p3[1]];
              const value = swapArrays ? thirdPair[0] : thirdPair[1];
              for (let j = 0; j < secondSet.length; ++j) {
                if (value === secondSet[j]) {
                  markAsUsed(ultPair);
                  markAsUsed(penPair);
                  markAsUsed(thirdPair);

                  firstSet.splice(i, 1);
                  secondSet.splice(j, 1);

                  reversals.push(flipPairing(thirdPair));
                  reversals.push(flipPairing(penPair));
                  reversals.push(flipPairing(ultPair));

                  found = true;
                  i -= 1;
                  break;
                }
              }
            }
          }
        }
      }

      i += 1;
    }
  }

  seekOneFlips();
  seekTwoFlips(false);
  seekTwoFlips(true);
  seekThreeFlips(false);
  seekThreeFlips(true);

  return reversals;
}
