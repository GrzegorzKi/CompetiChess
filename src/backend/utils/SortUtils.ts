import Tiebreaker, { compareHeadToHead } from '../Tiebreaker/Tiebreaker';
import { TrfPlayer } from '../types/TrfFileFormat';

export function createComparator(compareFuncs: PlayerComparator[]) {
  return (a: TrfPlayer, b: TrfPlayer): number => {
    for (let i = 0; i < compareFuncs.length; ++i) {
      const result = compareFuncs[i](a, b);
      if (result !== 0) {
        return result;
      }
    }

    // If they are equal, compare positional ranks
    return a.rank - b.rank;
  };
}

type PlayerComparator = (first: TrfPlayer, second: TrfPlayer) => number;

// Sorts players by score in descending order
export function sortByScore(round: number): PlayerComparator {
  if (round < 1) {
    return () => 0;
  }
  return (first: TrfPlayer, second: TrfPlayer): number => {
    const firstScore = first.scores[round - 1]?.points ?? 0;
    const secondScore = second.scores[round - 1]?.points ?? 0;
    return secondScore - firstScore;
  };
}

export function sortByRank(first: TrfPlayer, second: TrfPlayer): number {
  return first.rank - second.rank;
}

// Sorts players by selected tie-breaker in descending order
export function sortByTiebreaker(round: number, tiebreaker: Tiebreaker): PlayerComparator {
  if (tiebreaker === Tiebreaker.DIRECT_ENCOUNTER) {
    return compareHeadToHead;
  }
  return (first: TrfPlayer, second: TrfPlayer): number => {
    const firstScore = first.scores[round - 1]?.tiebreakers[tiebreaker] ?? 0;
    const secondScore = second.scores[round - 1]?.tiebreakers[tiebreaker] ?? 0;
    return secondScore - firstScore;
  };
}
