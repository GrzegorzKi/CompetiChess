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

import { defaultTrfGame } from '#/TrfxParser/parseTrfGames';
import { Color, GameResult, Game, Player, PlayersRecord } from '#/types/Tournament';
import { numberComparator } from '#/utils/SortUtils';

const colors = ['w', 'b', '-'];
const gameResults = [
  '+', '-',
  'W', 'D', 'L',
  '1', '=', '0',
  'H', 'F', 'U', 'Z'
];
export const byeResults = [
  GameResult.ZERO_POINT_BYE,
  GameResult.HALF_POINT_BYE,
  GameResult.FULL_POINT_BYE,
  GameResult.PAIRING_ALLOCATED_BYE
] as const;
const unplayedResults = [
  ...byeResults,
  GameResult.FORFEIT_WIN,
  GameResult.FORFEIT_LOSS
] as const;

export function isValidColor(color: string): color is Color {
  return colors.includes(color);
}

export function isValidResult(result: string): result is GameResult {
  return gameResults.includes(result);
}

export function isResultABye(result: GameResult): result is typeof byeResults[number] {
  return (byeResults as readonly GameResult[]).includes(result);
}

export function isResultAnUnplayed(result: GameResult, opponent?: number)
    : result is (typeof unplayedResults[number] | GameResult.DRAW) {
  return (unplayedResults as readonly GameResult[]).includes(result)
    || (result === GameResult.DRAW && opponent === undefined);
}

export function validateGameEntry({ opponent, color, result }: Game): boolean {
  if (opponent === undefined && color !== Color.NONE) {
    return false;
  }

  if (opponent !== undefined && isResultABye(result)) {
    return false;
  }

  if (!isResultAnUnplayed(result, opponent)
    && color === Color.NONE) {
    return false;
  }

  return true;
}

export function participatedInPairing({ opponent, result }: Game): boolean {
  return opponent !== undefined || result === GameResult.PAIRING_ALLOCATED_BYE;
}

export function gameWasPlayed({ opponent, color, result }: Game): boolean {
  return opponent !== undefined
    && color !== Color.NONE
    && result !== GameResult.FORFEIT_WIN
    && result !== GameResult.FORFEIT_LOSS;
}

export function isUnplayedWin({ opponent, result }: Game): boolean {
  // In case of using normal result symbols on unplayed games
  if (opponent === undefined && (result === GameResult.WIN || result === GameResult.UNRATED_WIN)) {
    return true;
  }
  return result === GameResult.FORFEIT_WIN
    || result === GameResult.FULL_POINT_BYE;
}

export function isUnplayedDraw({ opponent, result }: Game): boolean {
  // In case of using normal result symbols on unplayed games
  if (opponent === undefined
    && (result === GameResult.DRAW || result === GameResult.UNRATED_DRAW)) {
    return true;
  }
  return result === GameResult.HALF_POINT_BYE;
}

export function addByeToPlayer(player: Player, round: number): void {
  if (!player.notPlayed.includes(round)) {
    player.notPlayed.push(round);
    player.notPlayed.sort(numberComparator);
  }
}

function findLateRound(games: Game[], _default: number) {
  for (const game of games) {
    if (participatedInPairing(game)) {
      return game.round;
    }
  }
  return _default;
}

export function assignByesAndLates(
  players: PlayersRecord,
  playedRounds: number,
  byes: Array<number>
): void {
  const nextRound = playedRounds + 1;

  Object.entries(players).forEach(([, player]) => {
    player.notPlayed = [];
    const { games } = player;

    for (const game of games) {
      if (!participatedInPairing(game)) {
        player.notPlayed.push(game.round);
      }
    }

    const late = findLateRound(games, nextRound);

    if (late > 1) {
      player.late = late;
    }
  });

  for (const bye of byes) {
    const player = players[bye];
    if (player !== undefined) {
      addByeToPlayer(player, nextRound);
    }
  }
}

export function evenUpGamesHistoryPlayer(player: Player, upTo: number): void {
  for (let num = player.games.length; num < upTo; ++num) {
    player.games.push(defaultTrfGame(num));
  }
}

export function evenUpGamesHistory(players: PlayersRecord, upTo: number): void {
  for (const [, player] of Object.entries(players)) {
    evenUpGamesHistoryPlayer(player, upTo);
  }
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

export function isWithdrawnOrLate({ withdrawn, late }: Player,
  roundOneIndexed: number): boolean {
  return (withdrawn !== undefined && roundOneIndexed >= withdrawn)
    || (late !== undefined && roundOneIndexed < late);
}

export function isAbsentFromRound({ withdrawn, late, notPlayed }: Player,
  roundOneIndexed: number): boolean {
  return (withdrawn !== undefined && roundOneIndexed >= withdrawn)
    || (late !== undefined && roundOneIndexed < late)
    || (notPlayed.includes(roundOneIndexed));
}

export function getTypeOfBye(player: Player, roundOneIndexed: number)
    : GameResult.HALF_POINT_BYE | GameResult.ZERO_POINT_BYE {
  const found = player.games.findIndex((value) => value.result === GameResult.HALF_POINT_BYE
    || value.result === GameResult.FULL_POINT_BYE);

  if (found < 0 && !isWithdrawnOrLate(player, roundOneIndexed)) {
    return GameResult.HALF_POINT_BYE;
  }
  return GameResult.ZERO_POINT_BYE;
}

export function createByeRound(player: Player, atRound: number): Game {
  return {
    round: atRound,
    color: Color.NONE,
    result: getTypeOfBye(player, atRound)
  };
}
