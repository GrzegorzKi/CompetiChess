import { isUnplayedDraw, isUnplayedWin } from '../utils/TrfUtils';

import TournamentData from './TournamentData';
import { Color, TiebreakersPoints, TrfPlayer } from './TrfFileFormat';

const enum Tiebreaker {
  CUMULATIVE,
  ROUNDS_WON,
  ROUNDS_WON_BLACK_PIECES,
}
export default Tiebreaker;

function calcCumulative(tournament: TournamentData, player: TrfPlayer, forRound: number): number {
  const { games, scores, playerId } = player;
  const len = Math.min(games.length, forRound);
  if (scores.length < len) {
    tournament.recalculateScores(player, games.length, scores.length + 1);
  }

  let calcPts = 0.0;
  for (let i = 0; i < len; ++i) {
    calcPts += scores[i].points;
    if (isUnplayedWin(playerId, games[i])) {
      calcPts -= 1;
    } else if (isUnplayedDraw(playerId, games[i])) {
      calcPts -= 0.5;
    }
  }

  return calcPts;
}

function calcRoundsWon(tournament: TournamentData,
  { games, playerId }: TrfPlayer,
  forRound: number): number {
  let roundsWon = 0;
  const len = Math.min(games.length, forRound);
  for (let i = 0; i < len; ++i) {
    const { result, opponent } = games[i];
    if (playerId !== opponent && (result === '1' || result === 'W' || result === '+')) {
      roundsWon += 1;
    }
  }
  return roundsWon;
}

function calcRoundsWonBlackPieces(tournament: TournamentData,
  { games, playerId }: TrfPlayer,
  forRound: number): number {
  let roundsWon = 0;
  const len = Math.min(games.length, forRound);
  for (let i = 0; i < len; ++i) {
    const { color, result, opponent } = games[i];
    if (playerId !== opponent && color === Color.BLACK && (result === '1' || result === 'W')) {
      roundsWon += 1;
    }
  }
  return roundsWon;
}

type CalcFunction = (tournament: TournamentData, player: TrfPlayer, forRound: number) => number;
const tiebreakerMap = (function () {
  const map: Record<Tiebreaker, CalcFunction> = Object.create(null);
  map[Tiebreaker.CUMULATIVE] = calcCumulative;
  map[Tiebreaker.ROUNDS_WON] = calcRoundsWon;
  map[Tiebreaker.ROUNDS_WON_BLACK_PIECES] = calcRoundsWonBlackPieces;
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

export function calculateTiebreakers(
  tournament: TournamentData,
  player: TrfPlayer,
  forRound: number
): TiebreakersPoints {
  const { tiebreakers } = tournament.configuration;
  const tbValues: TiebreakersPoints = Object.create(null);
  for (let i = 0, len = tiebreakers.length; i < len; ++i) {
    tbValues[tiebreakers[i]] = calculateValue(tiebreakers[i], tournament, player, forRound);
  }
  return tbValues;
}
