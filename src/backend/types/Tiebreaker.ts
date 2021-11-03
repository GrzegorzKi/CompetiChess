import { gameWasPlayed, isUnplayedDraw, isUnplayedWin } from '../utils/TrfUtils';

import TournamentData from './TournamentData';
import {
  Color, GameResult, TiebreakersPoints, TrfGame, TrfPlayer
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
  MODIFIED_MEDIAN = 'ModM',
  SOLKOFF = 'SOff',
  ARO = ' ARO',
  AROC_1 = 'AROC1',
  OPPOSITION_PERFORMANCE = 'OpPf',
}
export default Tiebreaker;

function calcCumulativeCut(roundsCut: number): CalcFunction {
  return (tournament: TournamentData,
    { games, scores }: TrfPlayer,
    forRound: number): number => {
    const len = Math.min(games.length, forRound);

    let calcPts = 0.0;
    for (let r = roundsCut; r < len; ++r) {
      calcPts += scores[r].points;
      if (isUnplayedWin(games[r])) {
        calcPts -= 1;
      } else if (isUnplayedDraw(games[r])) {
        calcPts -= 0.5;
      }
    }

    return calcPts;
  };
}

function calcOppositionCumulative(tournament: TournamentData,
  { games, playerId }: TrfPlayer,
  forRound: number): number {
  const { players } = tournament;
  const round = Math.min(games.length, forRound);

  let calcCumul = 0.0;
  for (let r = 0; r < round; ++r) {
    const opponent = games[r].opponent ?? playerId;

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
  { games }: TrfPlayer,
  forRound: number): number {
  let roundsWon = 0;
  const len = Math.min(games.length, forRound);
  for (let i = 0; i < len; ++i) {
    const { result, opponent } = games[i];
    if (opponent !== undefined && (result === '1' || result === 'W' || result === '+')) {
      roundsWon += 1;
    }
  }
  return roundsWon;
}

function calcRoundsWonBlackPieces(_: TournamentData,
  { games }: TrfPlayer,
  forRound: number): number {
  let roundsWon = 0;

  const len = Math.min(games.length, forRound);
  for (let i = 0; i < len; ++i) {
    const { color, result, opponent } = games[i];
    if (opponent !== undefined && color === Color.BLACK && (result === '1' || result === 'W')) {
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
  { games }: TrfPlayer,
  forRound: number): number {
  let roundsBlack = 0;

  const len = Math.min(games.length, forRound);
  for (let round = 0; round < len; ++round) {
    if (gameWasPlayed(games[round]) && games[round].color === Color.BLACK) {
      roundsBlack += 1;
    }
  }
  return roundsBlack;
}

function calcKashdan(_: TournamentData,
  { games }: TrfPlayer,
  forRound: number): number {
  let calcPts = 0;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    if (gameWasPlayed(games[r])) {
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

function calculateVirtualOpponentScore(tournament: TournamentData,
  game: TrfGame,
  initialPoints: number,
  forRound: number,
  notPlayedIsDraw = false): number {
  const getPoints = notPlayedIsDraw
    ? tournament.getPointsUnplayedAsDraw
    : tournament.getPoints;

  let vPoints = initialPoints;
  vPoints += (tournament.configuration.pointsForWin - getPoints(game));
  vPoints += 0.5 * (forRound - (game.round - 1));
  return vPoints;
}

// Calculate Sonneborn-Berger score, based on opponent's scores.
// Not played opponents' games are counted as if played against virtual opponent.
function calcSonnebornBerger(tournament: TournamentData,
  { games, scores }: TrfPlayer,
  forRound: number): number {
  const { players } = tournament;

  let calcPts = 0;
  const len = Math.min(games.length, forRound);

  for (let r = 0; r < len; ++r) {
    const { opponent, result } = games[r];
    if (gameWasPlayed(games[r])) {
      if (result === '1' || result === 'W') {
        calcPts += tournament.calculatePoints(forRound, players[opponent!].games, true);
      } else if (result === '=' || result === 'D') {
        calcPts += (tournament.calculatePoints(forRound, players[opponent!].games, true) * 0.5);
      }
    } else {
      calcPts += calculateVirtualOpponentScore(tournament,
        games[r],
        scores[r].points,
        forRound);
    }
  }

  return calcPts;
}

// Calculate Modified Median score, based on opponent's scores.
//
// It is a variant of Buchholz, with difference that
// unplayed games are counted as opponents with adjusted scores of 0.
function calcModifiedMedian(tournament: TournamentData,
  { games, scores }: TrfPlayer,
  forRound: number): number {
  const { players } = tournament;

  const len = Math.min(games.length, forRound);
  const opScores: number[] = [];

  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (gameWasPlayed(games[r])) {
      opScores.push(tournament.calculatePoints(forRound, players[opponent!].games, true));
    }
    // If the player involved in the tie has any unplayed games,
    // they count as opponents with adjusted scores of 0.
  }

  opScores.sort((a, b) => a - b);

  function getRange() {
    const cutAmount = (len >= 9) ? 2 : 1;
    const halfMaxPoints = (tournament.configuration.pointsForWin * forRound) / 2;
    if (scores[forRound - 1].points > halfMaxPoints) {
      return { low: cutAmount, high: opScores.length };
    }
    if (scores[forRound - 1].points < halfMaxPoints) {
      return { low: 0, high: opScores.length - cutAmount };
    }
    return { low: cutAmount, high: opScores.length - cutAmount };
  }

  const range = getRange();

  // Calculate Median-Buchholz by excluding the highest and the lowest scores
  let calcPts = 0;
  for (let i = range.low; i < range.high; ++i) {
    calcPts += opScores[i];
  }
  return calcPts;
}

// Calculate Solkoff score, based on opponent's scores.
//
// It is a variant of Buchholz, with difference that
// unplayed games are counted as opponents with adjusted scores of 0.
function calcSolkoff(tournament: TournamentData,
  { games, scores }: TrfPlayer,
  forRound: number): number {
  const { players } = tournament;

  const len = Math.min(games.length, forRound);
  let calcPts = 0;

  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (gameWasPlayed(games[r])) {
      calcPts += tournament.calculatePoints(forRound, players[opponent!].games, true);
    }
    // If the player involved in the tie has any unplayed games,
    // they count as opponents with adjusted scores of 0.
  }

  return calcPts;
}

// Calculate Buchholz score, based on opponent's scores.
// Not played opponents' games are counted as if played against virtual opponent.
function calcBuchholz(tournament: TournamentData,
  { games, scores }: TrfPlayer,
  forRound: number): number {
  const { players } = tournament;

  const len = Math.min(games.length, forRound);
  let calcPts = 0;

  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (gameWasPlayed(games[r])) {
      calcPts += tournament.calculatePoints(forRound, players[opponent!].games, true);
    } else {
      calcPts += calculateVirtualOpponentScore(tournament,
        games[r],
        scores[r].points,
        forRound);
    }
  }

  return calcPts;
}

function calcMedianBuchholz(tournament: TournamentData,
  { games, scores }: TrfPlayer,
  forRound: number): number {
  const { players } = tournament;

  const len = Math.min(games.length, forRound);
  const opScores: number[] = [];

  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (gameWasPlayed(games[r])) {
      opScores.push(tournament.calculatePoints(forRound, players[opponent!].games, true));
    } else {
      opScores.push(calculateVirtualOpponentScore(tournament,
        games[r],
        scores[r].points,
        forRound));
    }
  }

  opScores.sort((a, b) => a - b);

  // Calculate Median-Buchholz by excluding the highest and the lowest scores
  let calcPts = 0;
  for (let i = 1, sLen = opScores.length - 1; i < sLen; ++i) {
    calcPts += opScores[i];
  }
  return calcPts;
}

function calcBuchholzCutOne(tournament: TournamentData,
  { games, scores }: TrfPlayer,
  forRound: number): number {
  const { players } = tournament;

  const len = Math.min(games.length, forRound);
  let calcPts = 0;
  let lowestScore = Infinity;

  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (gameWasPlayed(games[r])) {
      const opPoints = tournament.calculatePoints(forRound, players[opponent!].games, true);
      calcPts += opPoints;
      if (opPoints < lowestScore) {
        lowestScore = opPoints;
      }
    } else {
      const opPoints = calculateVirtualOpponentScore(tournament,
        games[r],
        scores[r].points,
        forRound);
      calcPts += opPoints;
      if (opPoints < lowestScore) {
        lowestScore = opPoints;
      }
    }
  }

  return calcPts > 0 ? calcPts - lowestScore : 0;
}

function calcAvgRatingOfOpponents({ players }: TournamentData,
  { games }: TrfPlayer,
  forRound: number): number {
  let sumRating = 0;
  let roundsPlayed = 0;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (opponent !== undefined) {
      sumRating += players[opponent].rating;
      roundsPlayed += 1;
    }
  }

  return roundsPlayed !== 0 ? Math.floor(sumRating / roundsPlayed) : 0;
}

function calcAvgRatingOfOpponentsCutOne({ players }: TournamentData,
  { games }: TrfPlayer,
  forRound: number): number {
  let sumRating = 0;
  let roundsPlayed = 0;
  let hadBye = false;
  let lowestRating = 9999;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    // We cut forfeits and byes from calculations, according to FIDE regulations
    if (gameWasPlayed(games[r])) {
      const opRating = players[opponent!].rating;
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

function calcOppositionPerformance({ players }: TournamentData,
  { games }: TrfPlayer,
  forRound: number): number {
  let sumRating = 0;
  let roundsPlayed = 0;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    const { opponent, result } = games[r];
    if (opponent !== undefined) {
      sumRating += players[opponent].rating;
      if (result === GameResult.WIN
        || result === GameResult.UNRATED_WIN
        || result === GameResult.FORFEIT_WIN) {
        sumRating += 400;
      } else if (result === GameResult.LOSS
        || result === GameResult.UNRATED_LOSS
        || result === GameResult.FORFEIT_LOSS) {
        sumRating -= 400;
      }
      roundsPlayed += 1;
    }
  }

  return roundsPlayed !== 0 ? Math.floor(sumRating / roundsPlayed) : 0;
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
  [Tiebreaker.HEAD_TO_HEAD]: () => 0,
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
  [Tiebreaker.BUCHHOLZ]: calcBuchholz,
  [Tiebreaker.BUCHHOLZ_CUT_1]: calcBuchholzCutOne,
  [Tiebreaker.MEDIAN_BUCHHOLZ]: calcMedianBuchholz,
  [Tiebreaker.MODIFIED_MEDIAN]: calcModifiedMedian,
  [Tiebreaker.SOLKOFF]: calcSolkoff,
  [Tiebreaker.ARO]: calcAvgRatingOfOpponents,
  [Tiebreaker.AROC_1]: calcAvgRatingOfOpponentsCutOne,
  [Tiebreaker.OPPOSITION_PERFORMANCE]: calcOppositionPerformance,
};

export function calculateValue(
  tiebreaker: Tiebreaker,
  tournament: TournamentData,
  player: TrfPlayer,
  forRound: number
): number {
  const tiebreakerFunc = tiebreakerMap[tiebreaker];
  return tiebreakerFunc(tournament, player, forRound);
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
