import Tiebreaker, { compareHeadToHead } from '../Tiebreaker/Tiebreaker';
import { TrfPlayer } from '../types/TrfFileFormat';

export type CompareType = {
  index: number,
  player: TrfPlayer
}

export function createComparator(compareFuncs: PlayerComparator[]) {
  return (a: CompareType, b: CompareType): number => {
    for (let i = 0; i < compareFuncs.length; ++i) {
      const result = compareFuncs[i](a.player, b.player);
      if (result !== 0) {
        return result;
      }
    }

    // If they are equal, return index comparison to preserve order
    return a.index - b.index;
  };
}

type PlayerComparator = (first: TrfPlayer, second: TrfPlayer) => number;

// Sorts players by score in descending order
export function sortByScore(round: number) {
  return (first: TrfPlayer, second: TrfPlayer): number => {
    const firstScore = first.scores[round - 1]?.points ?? 0;
    const secondScore = second.scores[round - 1]?.points ?? 0;
    return secondScore - firstScore;
  };
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
