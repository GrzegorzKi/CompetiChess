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

import Tiebreaker, { tiebreakers } from '#/Tiebreaker/Tiebreaker';
import { Player } from '#/types/Tournament';
import { computeRanks } from '#/utils/TournamentUtils';

function stringifyTiebreakers(tbList: Tiebreaker[],
  { games, scores }: Player,
  forRound: number): string {
  let string = '';

  const round = Math.max(Math.min(games.length, forRound) - 1, 0);
  for (let i = 0; i < tbList.length; ++i) {
    const value = scores[round].tiebreakers[tbList[i]] ?? 0;
    const tbInfo = tiebreakers[tbList[i]];
    string += ' ';
    string += value.toFixed(tbInfo.decimalPlaces ?? 1).padStart(tbInfo.abbr.length);
  }
  return string;
}

function createHeader(tbList: Tiebreaker[]) {
  let string = '  Id  Pts Rank |';
  for (let i = 0; i < tbList.length; ++i) {
    string += ' ';
    string += tiebreakers[tbList[i]].abbr;
  }
  string += `\n${'-'.repeat(string.length + 1)}\n`;
  return string;
}

export default function exportComparison(
  players: Player[],
  tbList: Tiebreaker[],
  forRound: number
): string {
  function getPoints({ scores }: Player) {
    if (forRound <= 0) {
      return 0;
    }
    return scores[forRound - 1].points;
  }

  const { playersByRank, sortedPlayers } = computeRanks(players, tbList, forRound);

  let resultString = '';
  resultString += createHeader(tbList);

  for (let i = 0, len = sortedPlayers.length; i < len; ++i) {
    if (sortedPlayers[i] !== undefined) {
      const { playerId } = sortedPlayers[i];
      const points = getPoints(sortedPlayers[i]);

      if (playerId > 9999 || points > 99.9) {
        // FIXME Return error code instead
        return '';
      }
      resultString += `${(playerId + 1).toString().padStart(4)} ${points.toFixed(1).padStart(4)} ${playersByRank[playerId].toString().padStart(4)} |`;
      resultString += stringifyTiebreakers(tbList,
        sortedPlayers[i],
        forRound);
      resultString += '\n';
    }
  }

  return resultString;
}
