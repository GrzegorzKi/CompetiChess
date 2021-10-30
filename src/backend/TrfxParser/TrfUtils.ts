import ParseResult, { ErrorCode } from '../types/ParseResult';
import TrfFileFormat, {
  Color, Configuration, GameResult, Sex, TrfGame, TrfPlayer,
} from '../types/TrfFileFormat';

import { defaultTrfGame } from './parseTrfGames';

const colors = ['w', 'b', '-'];
const gameResults = [
  '+', '-',
  'W', 'D', 'L',
  '1', '=', '0',
  'H', 'F', 'U', 'Z'
];
const byeResults = [
  GameResult.ZERO_POINT_BYE,
  GameResult.HALF_POINT_BYE,
  GameResult.FULL_POINT_BYE,
  GameResult.PAIRING_ALLOCATED_BYE
];
const unplayedResults = [
  ...byeResults,
  GameResult.FORFEIT_WIN,
  GameResult.FORFEIT_LOSS
];

export function parseSex(char: string): Sex {
  if (char === 'm') {
    return Sex.MALE;
  }
  if (char === 'w' || char === 'f') {
    return Sex.FEMALE;
  }
  return Sex.UNSPECIFIED;
}

export function isValidColor(color: string): color is Color {
  return colors.includes(color);
}

export function isValidResult(result: string): result is GameResult {
  return gameResults.includes(result);
}

export function validateGameEntry({ opponent, color, result }: TrfGame, playerId: number): boolean {
  if (color !== Color.NONE && opponent === playerId) {
    return false;
  }

  if (byeResults.includes(result) && opponent !== playerId) {
    return false;
  }

  if (!unplayedResults.includes(result)
    && color === Color.NONE
    && (opponent !== playerId || result !== GameResult.DRAW)) {
    return false;
  }

  return true;
}

export function participatedInPairing({ opponent, result }: TrfGame, playerId: number): boolean {
  return opponent !== playerId
    || result === GameResult.PAIRING_ALLOCATED_BYE
    || result === GameResult.FORFEIT_WIN;
}

export function gameWasPlayed({ opponent, color, result }: TrfGame, playerId: number): boolean {
  return opponent !== playerId
    && color !== Color.NONE
    && result !== GameResult.FORFEIT_WIN
    && result !== GameResult.FORFEIT_LOSS;
}

export function calculatePlayedRounds(players: TrfPlayer[]): number {
  let playedRounds = 0;
  players.forEach((player) => {
    for (let num = player.games.length - 1; num >= 0; --num) {
      const game = player.games[num];
      if (participatedInPairing(game, player.playerId)) {
        if (num >= playedRounds) {
          playedRounds = num + 1;
        }
        break;
      }
    }
  });
  return playedRounds;
}

export function evenUpMatchHistories(players: TrfPlayer[], upTo: number): void {
  players.forEach((player) => {
    for (let num = player.games.length; num < upTo; ++num) {
      player.games.push(defaultTrfGame(num, player.playerId));
    }
  });
}

export function removeDummyPlayers(players: TrfPlayer[]): void {
  for (let i = 0; i < players.length; ++i) {
    if (players[i] !== undefined && players[i].isDummy) {
      // eslint-disable-next-line no-param-reassign
      delete players[i];
    }
  }
}

function invertColor(color: Color): Color {
  if (color === Color.WHITE) {
    return Color.BLACK;
  }
  if (color === Color.BLACK) {
    return Color.WHITE;
  }
  return Color.NONE;
}

export function inferInitialColor({
  players, playersByPosition, playedRounds, configuration
}: TrfFileFormat): Color {
  const playersToIter = (configuration.matchByRank ? playersByPosition : players);

  let invert = false;

  for (let r = 0; r < playedRounds; ++r) {
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

export function validatePairConsistency(players: TrfPlayer[]): ParseResult<null> {
  for (let i = 0, len = players.length; i < len; ++i) {
    if (players[i] !== undefined) {
      const { games, playerId } = players[i];
      for (let r = 0, rLen = games.length; r < rLen; ++r) {
        if (gameWasPlayed(games[r], playerId)) {
          const opponent = players[games[r].opponent];
          if (opponent === undefined
            || !gameWasPlayed(opponent.games[r], opponent.playerId)
            || opponent.games[r].color === games[r].color
            || opponent.games[r].opponent !== playerId) {
            return {
              error: ErrorCode.PAIRING_CONTRADICTION,
              what: `Round ${r}, id ${playerId}`,
            };
          }
        }
      }
    }
  }

  return null;
}

export function getPoints(configuration: Configuration, { result }: TrfGame): number {
  switch (result) {
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
  default:
    // Should never happen
    return 0.0;
  }
}

export function calculatePoints(forRound: number, games: TrfGame[], configuration: Configuration)
  : number {
  let calcPts = 0.0;
  const maxLen = Math.min(games.length, forRound);
  for (let r = 0; r < maxLen; ++r) {
    calcPts += getPoints(configuration, games[r]);
  }
  return calcPts;
}

/**
 * Check that the score in the TRF matches the score computed by counting
 * the number of wins and draws for that player and (optionally) adding
 * the acceleration. Also check that there are not more accelerated rounds
 * than tournament rounds.
 */
export function validateScores(trfxData: TrfFileFormat): ParseResult<null> {
  const { players, playedRounds, configuration } = trfxData;

  for (let i = 0, len = players.length; i < len; ++i) {
    const player = players[i];
    if (player !== undefined) {
      const { accelerations, games } = player;
      if (accelerations.length > configuration.expectedRounds) {
        return { error: ErrorCode.TOO_MANY_ACCELERATIONS, what: `${player.playerId}` };
      }

      const calcPts = calculatePoints(playedRounds, games, configuration);

      // Try to correct amount of points if acceleration or future round
      // points were added to TRF score
      if (player.points !== calcPts) {
        const acc = accelerations[playedRounds] ?? 0;
        const nextRoundPts = games[playedRounds] !== undefined
          ? getPoints(configuration, games[playedRounds])
          : 0.0;
        const possiblePoints = [
          player.points - acc,
          player.points - nextRoundPts,
          player.points - acc - nextRoundPts
        ];

        const foundVal = possiblePoints.find((value) => value === calcPts);
        if (foundVal !== undefined) {
          // Correct amount of points for the player
          player.points = foundVal;
        } else {
          return { error: ErrorCode.POINTS_MISMATCH, what: `${player.playerId}` };
        }
      }
    }
  }

  return null;
}
