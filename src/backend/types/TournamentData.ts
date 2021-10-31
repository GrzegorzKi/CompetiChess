import { Acceleration } from '../TrfxParser/parseAcceleration';
import { gameWasPlayed, invertColor, participatedInPairing } from '../TrfxParser/TrfUtils';

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
    expectedRounds: 0,
    matchByRank: false,
    initialColor: Color.NONE,
    pointsForWin: 1.0,
    pointsForDraw: 0.5,
    pointsForLoss: 0.0,
    pointsForPairingAllocatedBye: 1.0,
    pointsForZeroPointBye: 0.0,
    pointsForForfeitLoss: 0.0,
  };
}

class TournamentData implements TrfFileFormat {
  constructor();
  constructor(data: TrfFileFormat);

  constructor(data?: TrfFileFormat) {
    if (data !== undefined) {
      this.chiefArbiter = data.chiefArbiter;
      this.city = data.city;
      this.configuration = data.configuration;
      this.dateOfEnd = data.dateOfEnd;
      this.dateOfStart = data.dateOfStart;
      this.deputyArbiters = data.deputyArbiters;
      this.federation = data.federation;
      this.forbiddenPairs = data.forbiddenPairs;
      this.numberOfPlayers = data.numberOfPlayers;
      this.numberOfRatedPlayers = data.numberOfRatedPlayers;
      this.numberOfTeams = data.numberOfTeams;
      this.otherFields = data.otherFields;
      this.playedRounds = data.playedRounds;
      this.players = data.players;
      this.playersByPosition = data.playersByPosition;
      this.rateOfPlay = data.rateOfPlay;
      this.roundDates = data.roundDates;
      this.teams = data.teams;
      this.tournamentName = data.tournamentName;
      this.tournamentType = data.tournamentType;
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
      this.configuration = createDefaultConfiguration();
      this.otherFields = {};
      this.forbiddenPairs = [];
      this.playedRounds = 0;
    }
  }

  chiefArbiter: string;
  city: string;
  configuration: Configuration;
  dateOfEnd: string;
  dateOfStart: string;
  deputyArbiters: string[];
  federation: string;
  forbiddenPairs: ForbiddenPairs[];
  numberOfPlayers: number;
  numberOfRatedPlayers: number;
  numberOfTeams: number;
  otherFields: Record<string, string>;
  playedRounds: number;
  players: TrfPlayer[];
  playersByPosition: TrfPlayer[];
  rateOfPlay: string;
  roundDates: string[];
  teams: TrfTeam[];
  tournamentName: string;
  tournamentType: string;

  checkAndAssignAccelerations = (accelerations: Array<Acceleration>): ParseResult<null> => {
    for (let i = 0, len = accelerations.length; i < len; ++i) {
      const { playerId, values } = accelerations[i];
      if (this.players[playerId] === undefined) {
        return { error: ErrorCode.ACC_MISSING_ENTRY, playerId };
      }
      if (values.length > this.configuration.expectedRounds) {
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
          if (gameWasPlayed(games[r], playerId)) {
            const opponent = this.players[games[r].opponent];
            if (opponent === undefined
              || !gameWasPlayed(opponent.games[r], opponent.playerId)
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

  calculatePoints = (forRound: number, games: TrfGame[]): number => {
    let calcPts = 0.0;
    const maxLen = Math.min(games.length, forRound);
    for (let r = 0; r < maxLen; ++r) {
      calcPts += this.getPoints(games[r]);
    }
    return calcPts;
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
    default:
      // Should never happen
      return 0.0;
    }
  }

  /**
   * Check that the score in the TRF matches the score computed by counting
   * the number of wins and draws for that player and (optionally) adding
   * the acceleration.
   */
  validateScores = (): ParseResult<null> => {
    for (let i = 0, len = this.playersByPosition.length; i < len; ++i) {
      const {
        accelerations,
        games,
        playerId,
        points
      } = this.playersByPosition[i];

      const calcPts = this.calculatePoints(this.playedRounds, games);

      // Try to correct amount of points if acceleration or future round
      // points were added to TRF score
      if (points !== calcPts) {
        const acc = accelerations[this.playedRounds] ?? 0;
        const nextRoundPts = games[this.playedRounds] !== undefined
          ? this.getPoints(games[this.playedRounds])
          : 0.0;
        const possiblePoints = [
          points - acc,
          points - nextRoundPts,
          points - acc - nextRoundPts
        ];

        const foundVal = possiblePoints.find((value) => value === calcPts);
        if (foundVal !== undefined) {
          // Correct amount of points for the player
          this.playersByPosition[i].points = foundVal;
        } else {
          return { error: ErrorCode.POINTS_MISMATCH, playerId };
        }
      }
    }

    return null;
  }

  inferInitialColor = (): Color => {
    const playersToIter = (this.configuration.matchByRank ? this.playersByPosition : this.players);

    let invert = false;

    for (let r = 0; r < this.playedRounds; ++r) {
      for (let i = 0, pLen = playersToIter.length; i < pLen; ++i) {
        const trfGame = playersToIter[i]?.games[r];
        const playerId = playersToIter[i]?.playerId;

        if (trfGame !== undefined && participatedInPairing(trfGame, playerId)) {
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
}

export default TournamentData;
