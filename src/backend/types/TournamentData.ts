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

import { Pair } from '../Pairings/Pairings';
import { calculateTiebreakers } from '../Tiebreaker/Tiebreaker';
import { FideSwissRatingsNotConsistent } from '../Tiebreaker/TiebreakerSets';
import { Acceleration } from '../TrfxParser/parseAcceleration';
import { createComparator, sortByScore, sortByTiebreaker } from '../utils/SortUtils';
import { gameWasPlayed, invertColor, participatedInPairing } from '../utils/TrfUtils';

import ParseResult, { ErrorCode } from './ParseResult';
import TrfFileFormat, {
  Color,
  Configuration,
  ForbiddenPairs,
  GameResult,
  TrfGame,
  TrfPlayer,
  TrfTeam,
} from './TrfFileFormat';

export function createDefaultConfiguration(): Configuration {
  return {
    matchByRank: false,
    initialColor: Color.NONE,
    pointsForWin: 1.0,
    pointsForDraw: 0.5,
    pointsForLoss: 0.0,
    pointsForPairingAllocatedBye: 1.0,
    pointsForZeroPointBye: 0.0,
    pointsForForfeitLoss: 0.0,
    tiebreakers: [...FideSwissRatingsNotConsistent],
  };
}

class TournamentData implements TrfFileFormat {
  constructor();
  constructor(data: TrfFileFormat);

  constructor(data?: TrfFileFormat) {
    if (data !== undefined) {
      this.tournamentName = data.tournamentName;
      this.city = data.city;
      this.federation = data.federation;
      this.dateOfEnd = data.dateOfEnd;
      this.dateOfStart = data.dateOfStart;
      this.numberOfPlayers = data.numberOfPlayers;
      this.numberOfRatedPlayers = data.numberOfRatedPlayers;
      this.numberOfTeams = data.numberOfTeams;
      this.tournamentType = data.tournamentType;
      this.chiefArbiter = data.chiefArbiter;
      this.deputyArbiters = data.deputyArbiters;
      this.rateOfPlay = data.rateOfPlay;
      this.roundDates = data.roundDates;
      this.players = data.players;
      this.playersByPosition = data.playersByPosition;
      this.teams = data.teams;
      this.pairs = data.pairs;
      this.configuration = data.configuration;
      this.otherFields = data.otherFields;
      this.forbiddenPairs = data.forbiddenPairs;
      this.playedRounds = data.playedRounds;
      this.expectedRounds = data.expectedRounds;
    } else {
      this.tournamentName = '';
      this.city = '';
      this.federation = '';
      this.dateOfStart = '';
      this.dateOfEnd = '';
      this.numberOfPlayers = 0;
      this.numberOfRatedPlayers = 0;
      this.numberOfTeams = 0;
      this.tournamentType = '';
      this.chiefArbiter = '';
      this.deputyArbiters = [];
      this.rateOfPlay = '';
      this.roundDates = [];
      this.players = [];
      this.playersByPosition = [];
      this.teams = [];
      this.pairs = [];
      this.configuration = createDefaultConfiguration();
      this.otherFields = {};
      this.forbiddenPairs = [];
      this.playedRounds = 0;
      this.expectedRounds = 0;
    }
  }

  tournamentName: string;
  city: string;
  federation: string;
  dateOfStart: string;
  dateOfEnd: string;
  numberOfPlayers: number;
  numberOfRatedPlayers: number;
  numberOfTeams: number;
  tournamentType: string;
  chiefArbiter: string;
  deputyArbiters: string[];
  rateOfPlay: string;
  roundDates: string[];
  players: TrfPlayer[];
  playersByPosition: TrfPlayer[];
  teams: TrfTeam[];
  pairs: Array<Pair[]>
  configuration: Configuration;
  otherFields: Record<string, string>;
  forbiddenPairs: ForbiddenPairs[];
  playedRounds: number;
  expectedRounds: number;

  checkAndAssignAccelerations = (accelerations: Array<Acceleration>): ParseResult<null> => {
    for (let i = 0, len = accelerations.length; i < len; ++i) {
      const { playerId, values } = accelerations[i];
      if (this.players[playerId] === undefined) {
        return { error: ErrorCode.ACC_MISSING_ENTRY, playerId };
      }
      if (values.length > this.expectedRounds) {
        return { error: ErrorCode.TOO_MANY_ACCELERATIONS, playerId };
      }
      this.players[playerId].accelerations = values;
    }

    return null;
  }

  validatePairConsistency = (): ParseResult<null> => {
    for (let i = 0, len = this.players.length; i < len; ++i) {
      if (this.players[i] !== undefined) {
        const { games, playerId } = this.players[i];
        for (let r = 0, rLen = games.length; r < rLen; ++r) {
          if (gameWasPlayed(games[r])) {
            const opponent = this.players[games[r].opponent!];
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

    return null;
  }

  deletePairings = (fromRound: number): boolean => {
    if (this.playedRounds < fromRound) {
      return false;
    }

    this.players.forEach((player) => {
      // eslint-disable-next-line no-param-reassign
      player.games = player.games.slice(0, fromRound - 1);
      // eslint-disable-next-line no-param-reassign
      player.scores = player.scores.slice(0, fromRound - 1);
    });
    this.pairs = this.pairs.slice(0, fromRound - 1);

    return true;
  }

  calculatePoints = (forRound: number, games: TrfGame[], notPlayedIsDraw = false): number => {
    const getPoints = notPlayedIsDraw
      ? this.getPointsUnplayedAsDraw
      : this.getPoints;
    let calcPts = 0.0;
    const maxLen = Math.min(games.length, forRound);
    for (let r = 0; r < maxLen; ++r) {
      calcPts += getPoints(games[r]);
    }
    return calcPts;
  }

  recalculateScores = (player: TrfPlayer, toRound = Infinity, fromRound = 1): void => {
    const { games, scores } = player;
    if (fromRound - 1 < scores.length) {
      fromRound = scores.length + 1;
    }
    let calcPts = (fromRound > 1 ? scores[fromRound - 2].points : 0.0);

    const maxLen = Math.min(games.length, toRound);
    for (let r = fromRound - 1; r < maxLen; ++r) {
      calcPts += this.getPoints(games[r]);
      scores[r] = { round: r + 1, points: calcPts, tiebreakers: {} };
    }
  }

  recalculateTiebreakers = (player: TrfPlayer, toRound = Infinity, fromRound = 1): void => {
    const { games, scores } = player;
    if (fromRound - 1 < scores.length) {
      this.recalculateScores(player, toRound, scores.length + 1);
    }

    const maxLen = Math.min(games.length, toRound);
    for (let r = fromRound - 1; r < maxLen; ++r) {
      scores[r].tiebreakers = calculateTiebreakers(this, player, r + 1);
    }
  }

  getPoints = ({ result }: TrfGame): number => {
    switch (result) {
    case GameResult.FORFEIT_LOSS:
      return this.configuration.pointsForForfeitLoss;
    case GameResult.LOSS:
    case GameResult.UNRATED_LOSS:
      return this.configuration.pointsForLoss;
    case GameResult.ZERO_POINT_BYE:
      return this.configuration.pointsForZeroPointBye;
    case GameResult.PAIRING_ALLOCATED_BYE:
      return this.configuration.pointsForPairingAllocatedBye;
    case GameResult.WIN:
    case GameResult.FORFEIT_WIN:
    case GameResult.UNRATED_WIN:
    case GameResult.FULL_POINT_BYE:
      return this.configuration.pointsForWin;
    case GameResult.DRAW:
    case GameResult.UNRATED_DRAW:
    case GameResult.HALF_POINT_BYE:
      return this.configuration.pointsForDraw;
    case GameResult.UNASSIGNED:
    default:
      // Should never happen
      return 0.0;
    }
  }

  getPointsUnplayedAsDraw = (game: TrfGame): number => {
    if (gameWasPlayed(game)) {
      return this.getPoints(game);
    }
    return this.configuration.pointsForDraw;
  }

  inferInitialColor = (): Color => {
    const playersToIter = (this.configuration.matchByRank ? this.playersByPosition : this.players);

    let invert = false;

    for (let r = 0; r < this.playedRounds; ++r) {
      for (let i = 0, pLen = playersToIter.length; i < pLen; ++i) {
        const trfGame = playersToIter[i]?.games[r];

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
  }

  computeRanks = (forRound: number): {
    playersByRank: Record<number, number>,
    sortedPlayers: TrfPlayer[]
  } => {
    const sortedPlayers = this.sortByRank(forRound);

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
  }

  sortByRank = (forRound: number): TrfPlayer[] => {
    const playersSorted = [...this.players];

    const tbComparators = this.configuration.tiebreakers.map(
      (tb) => sortByTiebreaker(forRound, tb),
    );
    playersSorted.sort(createComparator([
      sortByScore(forRound),
      ...tbComparators,
    ]));
    return playersSorted;
  }

  reorderAndAssignPositionalRanks = (): void => {
    if (!this.configuration.matchByRank) {
      this.playersByPosition = [];
      this.players.forEach((player) => {
        this.playersByPosition.push(player);
      });
    }

    this.playersByPosition.forEach((player, index) => {
      player.rank = index;
    });
  }
}

export default TournamentData;
