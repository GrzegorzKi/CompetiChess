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

import ParseResult, { ErrorCode } from '../types/ParseResult';
import Tournament, {
  Color,
  Configuration,
  GameResult,
  Game,
  Player
} from '../types/Tournament';

import { Pair, readPairs } from '#/Pairings/Pairings';
import { calculateTiebreakers } from '#/Tiebreaker/Tiebreaker';
// import { FideSwissRatingsNotConsistent } from '#/Tiebreaker/TiebreakerSets';
import { Acceleration } from '#/TrfxParser/parseAcceleration';
import { gameWasPlayed, invertColor, participatedInPairing } from '#/utils/GamesUtils';
import { createComparator, sortByScore, sortByTiebreaker } from '#/utils/SortUtils';

export function createDefaultConfiguration(): Configuration {
  return {
    matchByRank: false,
    initialColor: Color.NONE,
    expectedRounds: 0,
    pointsForWin: 1.0,
    pointsForDraw: 0.5,
    pointsForLoss: 0.0,
    pointsForPairingAllocatedBye: 1.0,
    pointsForZeroPointBye: 0.0,
    pointsForForfeitLoss: 0.0,
    tiebreakers: [],
  };
}

export function createTournamentData(overrides?: Partial<Tournament>): Tournament {
  const data: Tournament = {
    tournamentName: '',
    city: '',
    federation: '',
    dateOfStart: '',
    dateOfEnd: '',
    numberOfPlayers: 0,
    numberOfRatedPlayers: 0,
    numberOfTeams: 0,
    tournamentType: '',
    chiefArbiter: '',
    deputyArbiters: [],
    rateOfPlay: '',
    roundDates: [],
    players: [],
    playersByPosition: [],
    teams: [],
    pairs: [],
    configuration: createDefaultConfiguration(),
    otherFields: {},
    forbiddenPairs: [],
    playedRounds: 0,
  };

  return Object.assign(
    data,
    overrides
  );
}

export function calculatePlayedRounds(players: Player[]): number {
  let playedRounds = 0;
  players.forEach((player) => {
    for (let num = player.games.length - 1; num >= 0; --num) {
      const game = player.games[num];
      if (participatedInPairing(game)) {
        if (num >= playedRounds) {
          playedRounds = num + 1;
        }
        break;
      }
    }
  });
  return playedRounds;
}

export function checkAndAssignAccelerations(players: Player[], accelerations: Acceleration[], expectedRounds = Infinity): ParseResult<void> {
  for (let i = 0, len = accelerations.length; i < len; ++i) {
    const { playerId, values } = accelerations[i];
    if (players[playerId] === undefined) {
      return {
        error: ErrorCode.ACC_MISSING_ENTRY,
        playerId
      };
    }
    if (values.length > expectedRounds) {
      return {
        error: ErrorCode.TOO_MANY_ACCELERATIONS,
        playerId
      };
    }
    players[playerId].accelerations = values;
  }
}

export function validatePairConsistency(players: Player[]): ParseResult<void> {
  for (let i = 0, len = players.length; i < len; ++i) {
    if (players[i] !== undefined) {
      const { games, playerId } = players[i];
      for (let r = 0, rLen = games.length; r < rLen; ++r) {
        if (gameWasPlayed(games[r])) {
          const opponent = players[games[r].opponent!];
          if (opponent === undefined
            || !gameWasPlayed(opponent.games[r])
            || opponent.games[r].color === games[r].color
            || opponent.games[r].opponent !== playerId) {
            return {
              error: ErrorCode.PAIRING_CONTRADICTION,
              firstPlayer: playerId,
              secondPlayer: opponent.playerId,
              round: r
            };
          }
        }
      }
    }
  }
}

export const deletePairings = ({ pairs, players, playedRounds }: Tournament, fromRound: number): boolean => {
  if (playedRounds < fromRound) {
    return false;
  }

  players.forEach((player) => {
    player.games.splice(fromRound - 1);
    player.scores.splice(fromRound - 1);
  });

  pairs.splice(fromRound - 1);

  return true;
};

export const getPoints = (game: Game, configuration: Configuration, notPlayedIsDraw = false): number => {
  if (notPlayedIsDraw && !gameWasPlayed(game)) {
    return configuration.pointsForDraw;
  }

  switch (game.result) {
  case GameResult.FORFEIT_LOSS:
    return configuration.pointsForForfeitLoss;
  case GameResult.LOSS:
  case GameResult.UNRATED_LOSS:
    return configuration.pointsForLoss;
  case GameResult.ZERO_POINT_BYE:
    return configuration.pointsForZeroPointBye;
  case GameResult.PAIRING_ALLOCATED_BYE:
    return configuration.pointsForPairingAllocatedBye;
  case GameResult.WIN:
  case GameResult.FORFEIT_WIN:
  case GameResult.UNRATED_WIN:
  case GameResult.FULL_POINT_BYE:
    return configuration.pointsForWin;
  case GameResult.DRAW:
  case GameResult.UNRATED_DRAW:
  case GameResult.HALF_POINT_BYE:
    return configuration.pointsForDraw;
  case GameResult.UNASSIGNED:
  default:
    // Should never happen
    return 0.0;
  }
};

export const calculatePoints = (
  forRound: number,
  games: Game[],
  configuration: Configuration,
  notPlayedIsDraw = false
): number => {
  let calcPts = 0.0;
  const maxLen = Math.min(games.length, forRound);
  for (let r = 0; r < maxLen; ++r) {
    calcPts += getPoints(games[r], configuration, notPlayedIsDraw);
  }
  return calcPts;
};

export function generatePairs(players: Player[], toRound: number): Array<Pair[]> {
  const roundsPairs: Array<Pair[]> = [];
  for (let i = 0; i < toRound; ++i) {
    const pairs = readPairs({
      players,
      fromRound: i + 1,
    });
    roundsPairs[i] = pairs.pairs;
  }

  return roundsPairs;
}

export const recalculateScores = (
  player: Player,
  configuration: Configuration,
  fromRound = 1,
  toRound = Infinity
): void => {
  const { games, scores } = player;
  fromRound = Math.max(fromRound, 1);

  let calcPts = (fromRound >= 2 ? scores[fromRound - 2].points : 0.0);

  const maxLen = Math.min(games.length, toRound);
  for (let r = fromRound - 1; r < maxLen; ++r) {
    calcPts += getPoints(games[r], configuration);
    scores[r] = { round: r + 1, points: calcPts, tiebreakers: {} };
  }
};

export const recalculateTiebreakers = (
  player: Player,
  players: Player[],
  configuration: Configuration,
  fromRound = 1,
  toRound = Infinity
): void => {
  const { games, scores } = player;

  fromRound = Math.max(fromRound, 1);
  const maxLen = Math.min(games.length, toRound);
  for (let round = fromRound; round <= maxLen; ++round) {
    scores[round - 1].tiebreakers = calculateTiebreakers(player, round, configuration, players);
  }
};

/// Recalculate players' scores.
///
/// Note: This method recalculates tiebreakers AFTER scores to avoid bugs.
///
/// @param {number} fromRound - Round number (one-offset) from which to recalculate
/// @param {number} toRound   - Round number (one-offset) to which recalculate (exclusive)
export const recalculatePlayerScores = (
  players: Player[],
  configuration: Configuration,
  fromRound?: number,
  toRound?: number
): void => {
  players.forEach(player => {
    recalculateScores(player, configuration, fromRound, toRound);
  });
  players.forEach(player => {
    recalculateTiebreakers(player, players, configuration, fromRound, toRound);
  });
};

export const getPlayers = (players: Player[], byPosition: number[], matchByRank: boolean) => {
  if (matchByRank) {
    return byPosition.map(i => players[i]);
  }
  return players;
};

export const inferInitialColor = (
  players: Player[],
  playedRounds = calculatePlayedRounds(players)
): Color => {
  let invert = false;

  for (let r = 0; r < playedRounds; ++r) {
    for (let i = 0, pLen = players.length; i < pLen; ++i) {
      const trfGame = players[i]?.games[r];

      if (trfGame !== undefined && participatedInPairing(trfGame)) {
        if (trfGame.color !== Color.NONE) {
          return (invert
            ? invertColor(trfGame.color)
            : trfGame.color);
        }
        invert = !invert;
      }
    }
  }

  return Color.NONE;
};

export const sortByRank = (tournament: Tournament, forRound: number): Player[] => {
  const playersSorted = [...tournament.players];

  const tbComparators = tournament.configuration.tiebreakers.map(
    (tb) => sortByTiebreaker(forRound, tb),
  );
  playersSorted.sort(createComparator([
    sortByScore(forRound),
    ...tbComparators,
  ]));
  return playersSorted;
};

export const computeRanks = (tournament: Tournament, forRound: number): {
  playersByRank: Record<number, number>,
  sortedPlayers: Player[]
} => {
  const sortedPlayers = sortByRank(tournament, forRound);

  let rankIndex = 1;
  const playersByRank: Record<number, number> = Object.create(null);
  for (let i = 0, len = sortedPlayers.length; i < len; ++i) {
    playersByRank[sortedPlayers[i].playerId] = rankIndex;
    rankIndex += 1;
  }

  return {
    playersByRank,
    sortedPlayers
  };
};

export const reorderAndAssignPositionalRanks = (
  players: Player[],
  playersByPosition: number[],
  matchByRank: boolean
): void => {
  if (!matchByRank) {
    playersByPosition.length = 0;
    players.forEach((player) => {
      playersByPosition.push(player.playerId);
    });
  }

  playersByPosition.forEach((id, index) => {
    players[id].rank = index;
  });
};
