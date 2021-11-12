/*
 * Copyright (c) 2021  Grzegorz Kita
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

import { defaultTrfGame } from '../TrfxParser/parseTrfGames';
import {
  Color, GameResult, Sex, TrfGame, TrfPlayer
} from '../types/TrfFileFormat';

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

export function validateGameEntry({ opponent, color, result }: TrfGame): boolean {
  if (color !== Color.NONE && opponent === undefined) {
    return false;
  }

  if (byeResults.includes(result) && opponent !== undefined) {
    return false;
  }

  if (!unplayedResults.includes(result)
    && color === Color.NONE
    && (opponent !== undefined || result !== GameResult.DRAW)) {
    return false;
  }

  return true;
}

export function participatedInPairing({ opponent, result }: TrfGame): boolean {
  return opponent !== undefined || result === GameResult.PAIRING_ALLOCATED_BYE;
}

export function gameWasPlayed({ opponent, color, result }: TrfGame): boolean {
  return opponent !== undefined
    && color !== Color.NONE
    && result !== GameResult.FORFEIT_WIN
    && result !== GameResult.FORFEIT_LOSS;
}

export function isUnplayedWin({ opponent, result }: TrfGame): boolean {
  // In case of using normal result symbols on unplayed games
  if (opponent === undefined && (result === GameResult.WIN || result === GameResult.UNRATED_WIN)) {
    return true;
  }
  return result === GameResult.FORFEIT_WIN
    || result === GameResult.FULL_POINT_BYE;
}

export function isUnplayedDraw({ opponent, result }: TrfGame): boolean {
  // In case of using normal result symbols on unplayed games
  if (opponent === undefined
    && (result === GameResult.DRAW || result === GameResult.UNRATED_DRAW)) {
    return true;
  }
  return result === GameResult.HALF_POINT_BYE;
}

export function calculatePlayedRounds(players: TrfPlayer[]): number {
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

export function evenUpMatchHistories(players: TrfPlayer[], upTo: number): void {
  players.forEach((player) => {
    for (let num = player.games.length; num < upTo; ++num) {
      player.games.push(defaultTrfGame(num));
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

export function isAbsentFromRound({ withdrawn, late, notPlayed }: TrfPlayer,
  roundOneIndexed: number): boolean {
  return (withdrawn === undefined || roundOneIndexed < withdrawn)
    && (late === undefined || roundOneIndexed >= late)
    && (notPlayed.includes(roundOneIndexed));
}

export function createByeRound(player: TrfPlayer, atRound: number): TrfGame {
  const found = player.games.findIndex((value) => value.result === GameResult.HALF_POINT_BYE
    || value.result === GameResult.FULL_POINT_BYE);

  if (found === -1) {
    return {
      round: atRound,
      color: Color.NONE,
      result: GameResult.HALF_POINT_BYE
    };
  }

  return {
    round: atRound,
    color: Color.NONE,
    result: GameResult.ZERO_POINT_BYE
  };
}
