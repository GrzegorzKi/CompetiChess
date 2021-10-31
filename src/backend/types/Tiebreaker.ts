import TournamentData from './TournamentData';
import { TrfPlayer } from './TrfFileFormat';

const enum Tiebreaker {
  MEDIAN_BUCHHOLZ,
  BUCHHOLZ,
  PROGRESS,
  ROUNDS_WON,
  INITIAL_RANK
}
export default Tiebreaker;

type CalcFunction = (tournament: TournamentData, player: TrfPlayer, forRound: number) => number;
const tiebreakerMap = (function () {
  const map: Record<Tiebreaker, CalcFunction> = Object.create(null);
  return map;
}());

export function calculateValue(
  tiebreaker: Tiebreaker,
  tournament: TournamentData,
  player: TrfPlayer,
  forRound: number
): number {
  const tiebreakerFunc = tiebreakerMap[tiebreaker];
  return tiebreakerFunc?.(tournament, player, forRound) ?? 0.0;
}
