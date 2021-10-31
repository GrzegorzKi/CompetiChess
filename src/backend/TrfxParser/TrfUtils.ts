import {
  Color, GameResult, Sex, TrfGame, TrfPlayer,
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

export function invertColor(color: Color): Color {
  if (color === Color.WHITE) {
    return Color.BLACK;
  }
  if (color === Color.BLACK) {
    return Color.WHITE;
  }
  return Color.NONE;
}
