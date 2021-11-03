import { gameWasPlayed, isUnplayedDraw, isUnplayedWin } from '../utils/TrfUtils';

import TournamentData from './TournamentData';
import {
  Color, GameResult, TiebreakersPoints, TrfPlayer
} from './TrfFileFormat';

const enum Tiebreaker {
  CUMULATIVE = 'Cumul',
  CUMULATIVE_CUT_1 = 'CumC1',
  OPPOSITION_CUMULATIVE = 'OpCuml',
  PROGRESSIVE = 'Progr',
  PROGRESSIVE_CUT_1 = 'PrgC1',
  ROUNDS_WON = 'RWon',
  ROUNDS_WON_BLACK_PIECES = 'RWnB',
  PLAYED_BLACKS = 'Blks',
  TIME_OF_LOSS = 'TmOL',
  HEAD_TO_HEAD = 'HtoH',
  KASHDAN = 'Kash',
  SONNEBORN_BERGER = '   SB',
  BUCHHOLZ = 'Buch',
  BUCHHOLZ_CUT_1 = 'Bch1',
  MEDIAN_BUCHHOLZ = 'MBch',
  ARO = ' ARO',
  AROC_1 = 'AROC1',
}
export default Tiebreaker;

function calcCumulativeCut(roundsCut: number): CalcFunction {
  return (tournament: TournamentData,
    { games, scores, playerId }: TrfPlayer,
    forRound: number): number => {
    const len = Math.min(games.length, forRound);

    let calcPts = 0.0;
    for (let r = roundsCut; r < len; ++r) {
      calcPts += scores[r].points;
      if (isUnplayedWin(playerId, games[r])) {
        calcPts -= 1;
      } else if (isUnplayedDraw(playerId, games[r])) {
        calcPts -= 0.5;
      }
    }

    return calcPts;
  };
}

function calcOppositionCumulative(tournament: TournamentData,
  { games }: TrfPlayer,
  forRound: number): number {
  const { players } = tournament;
  const round = Math.min(games.length, forRound);

  let calcCumul = 0.0;
  for (let r = 0; r < round; ++r) {
    const { opponent } = games[r];

    // Always calculate cumulative tiebreaker first
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const cumulValue = calculateValue(
      Tiebreaker.CUMULATIVE,
      tournament,
      players[opponent],
      forRound
    );

    calcCumul += cumulValue;
  }

  return calcCumul;
}

function calcProgressiveCut(roundsCut: number): CalcFunction {
  return (tournament: TournamentData, player: TrfPlayer, forRound: number): number => {
    const { games, scores } = player;
    const len = Math.min(games.length, forRound);

    let calcPts = 0.0;
    for (let i = roundsCut; i < len; ++i) {
      calcPts += scores[i].points;
    }

    return calcPts;
  };
}

function calcRoundsWon(_: TournamentData,
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

function calcRoundsWonBlackPieces(_: TournamentData,
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

function calcTimeOfLoss(_: TournamentData,
  { games }: TrfPlayer,
  forRound: number): number {
  const len = Math.min(games.length, forRound);
  for (let round = 0; round < len; ++round) {
    const { result } = games[round];
    if (result === '0' || result === 'L' || result === '-' || result === 'Z') {
      return round + 1;
    }
  }
  return len + 1;
}

function calcGamesWithBlack(_: TournamentData,
  { games, playerId }: TrfPlayer,
  forRound: number): number {
  let roundsBlack = 0;

  const len = Math.min(games.length, forRound);
  for (let round = 0; round < len; ++round) {
    if (gameWasPlayed(games[round], playerId) && games[round].color === Color.BLACK) {
      roundsBlack += 1;
    }
  }
  return roundsBlack;
}

function calcKashdan(_: TournamentData,
  { games, playerId }: TrfPlayer,
  forRound: number): number {
  let calcPts = 0;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    if (gameWasPlayed(games[r], playerId)) {
      const { result } = games[r];
      if (result === '1' || result === 'W') {
        calcPts += 4;
      } else if (result === '=' || result === 'D') {
        calcPts += 2;
      } else if (result === '0' || result === 'L') {
        calcPts += 1;
      }
    }
  }

  return calcPts;
}

// Calculate Sonneborn-Berger score, based on opponent's scores.
// Not played opponents' games are counted with their real score.
// (In contrast to other methods, like counting as a draw regardless of the result)
function calcSonnebornBerger({ players }: TournamentData,
  { games, playerId }: TrfPlayer,
  forRound: number): number {
  let calcPts = 0;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    const { opponent, result } = games[r];
    if (opponent !== playerId) {
      if (result === '1' || result === 'W' || result === '+') {
        calcPts += players[opponent].scores[r].points;
      } else if (result === '=' || result === 'D') {
        calcPts += (players[opponent].scores[r].points * 0.5);
      }
    } else {
      // TODO Calculate virtual opponent score
    }
  }

  return calcPts;
}

function calcBuchholz(tournament: TournamentData,
  { games, playerId }: TrfPlayer,
  forRound: number): number {
  const { players } = tournament;
  let calcPts = 0;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (opponent !== playerId) {
      calcPts += players[opponent].scores[r].points;
      const opGames = players[opponent].games;
      for (let i = 0; i < opGames.length; ++i) {
        if (opGames[i].result === GameResult.FULL_POINT_BYE
            || opGames[i].result === GameResult.PAIRING_ALLOCATED_BYE) {
          // TODO Reduce by value of FPB or PAB, add points for draw
          // tournament.getPoints(opGames[i])
        }
      }
    } else {
      // TODO Calculate virtual opponent score
    }
  }

  return calcPts;
}

function calcMedianBuchholz({ players }: TournamentData,
  { games, playerId }: TrfPlayer,
  forRound: number): number {
  const len = Math.min(games.length, forRound);

  const scores: number[] = [];

  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (opponent !== playerId) {
      scores.push(players[opponent].scores[r].points);
    } else {
      // TODO Calculate virtual opponent score
    }
  }

  scores.sort((a, b) => a - b);

  // Calculate Median-Buchholz by excluding the highest and the lowest scores
  let calcPts = 0;
  for (let i = 1, sLen = scores.length - 1; i < sLen; ++i) {
    calcPts += scores[i];
  }
  return calcPts;
}

function calcBuchholzCutOne({ players }: TournamentData,
  { games, playerId }: TrfPlayer,
  forRound: number): number {
  let calcPts = 0;
  let lowestScore = Infinity;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (opponent !== playerId) {
      const opPoints = players[opponent].scores[r].points;
      calcPts += opPoints;
      if (opPoints < lowestScore) {
        lowestScore = opPoints;
      }
    } else {
      // TODO Calculate virtual opponent score
    }
  }

  return calcPts > 0 ? calcPts - lowestScore : 0;
}

function calcAvgRatingOfOpponents({ players }: TournamentData,
  { games, playerId }: TrfPlayer,
  forRound: number): number {
  let sumRating = 0;
  let roundsPlayed = 0;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (opponent !== playerId) {
      sumRating += players[opponent].rating;
      roundsPlayed += 1;
    }
  }

  return roundsPlayed !== 0 ? Math.floor(sumRating / roundsPlayed) : 0;
}

function calcAvgRatingOfOpponentsCutOne({ players }: TournamentData,
  { games, playerId }: TrfPlayer,
  forRound: number): number {
  let sumRating = 0;
  let roundsPlayed = 0;
  let hadBye = false;
  let lowestRating = 9999;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    // We cut forfeits and byes from calculations, according to FIDE regulations
    if (gameWasPlayed(games[r], playerId)) {
      const opRating = players[opponent].rating;
      sumRating += opRating;
      roundsPlayed += 1;
      if (opRating < lowestRating) {
        lowestRating = opRating;
      }
    } else {
      hadBye = true;
    }
  }

  // If a player has one or more forfeits or byes, then no additional
  // results are to be cut from the calculation of AROC 1
  if (!hadBye) {
    sumRating -= lowestRating;
    roundsPlayed -= 1;
  }

  return roundsPlayed > 0 ? Math.floor(sumRating / roundsPlayed) : 0;
}

// There is no calculating function for head-to-head.
// It must be handled on per-pair basis.
export function compareHeadToHead(first: TrfPlayer, second: TrfPlayer): number {
  const index = first.games.findIndex((game) => game.opponent === second.playerId);
  if (index === -1) {
    return 0;
  }

  const { result: p1Result } = first.games[index];
  const { result: p2Result } = second.games[index];
  // Forfeit by win shouldn't be considered
  if (p1Result === '1' || p1Result === 'W') {
    return -1;
  }
  if (p2Result === '1' || p2Result === 'W') {
    return 1;
  }

  return 0;
}

type CalcFunction = (tournament: TournamentData, player: TrfPlayer, forRound: number) => number;
const tiebreakerMap: Record<Tiebreaker, CalcFunction> = {
  [Tiebreaker.CUMULATIVE]: calcCumulativeCut(0),
  [Tiebreaker.CUMULATIVE_CUT_1]: calcCumulativeCut(1),
  [Tiebreaker.OPPOSITION_CUMULATIVE]: calcOppositionCumulative,
  [Tiebreaker.PROGRESSIVE]: calcProgressiveCut(0),
  [Tiebreaker.PROGRESSIVE_CUT_1]: calcProgressiveCut(1),
  [Tiebreaker.ROUNDS_WON]: calcRoundsWon,
  [Tiebreaker.ROUNDS_WON_BLACK_PIECES]: calcRoundsWonBlackPieces,
  [Tiebreaker.TIME_OF_LOSS]: calcTimeOfLoss,
  [Tiebreaker.PLAYED_BLACKS]: calcGamesWithBlack,
  [Tiebreaker.KASHDAN]: calcKashdan,
  [Tiebreaker.SONNEBORN_BERGER]: calcSonnebornBerger,
  [Tiebreaker.ARO]: calcAvgRatingOfOpponents,
  [Tiebreaker.AROC_1]: calcAvgRatingOfOpponentsCutOne,
  [Tiebreaker.HEAD_TO_HEAD]: () => 0,
  [Tiebreaker.BUCHHOLZ]: calcBuchholz,
  [Tiebreaker.MEDIAN_BUCHHOLZ]: calcMedianBuchholz,
  [Tiebreaker.BUCHHOLZ_CUT_1]: calcBuchholzCutOne,
};

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
