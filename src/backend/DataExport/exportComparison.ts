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

import Tiebreaker, { tiebreakers } from '../Tiebreaker/Tiebreaker';
import TournamentData from '../types/TournamentData';
import { TrfPlayer } from '../types/TrfFileFormat';

function stringifyTiebreakers(tbList: Tiebreaker[],
  { games, scores }: TrfPlayer,
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

export default function exportComparison(tournament: TournamentData,
  forRound: number = tournament.playedRounds): string {
  function getPoints({ scores }: TrfPlayer) {
    if (forRound <= 0) {
      return 0;
    }
    return scores[forRound - 1].points;
  }

  if (forRound < 0 || forRound > tournament.playedRounds) {
    // eslint-disable-next-line no-param-reassign
    forRound = tournament.playedRounds;
  }

  const { configuration } = tournament;
  const { playersByRank, sortedPlayers } = tournament.computeRanks(forRound);

  let resultString = '';
  resultString += createHeader(configuration.tiebreakers);

  for (let i = 0, len = sortedPlayers.length; i < len; ++i) {
    if (sortedPlayers[i] !== undefined) {
      const { playerId } = sortedPlayers[i];
      const points = getPoints(sortedPlayers[i]);

      if (playerId > 9999 || points > 99.9) {
        // FIXME Return error code instead
        return '';
      }
      resultString += `${(playerId + 1).toString().padStart(4)} ${points.toFixed(1).padStart(4)} ${playersByRank[playerId].toString().padStart(4)} |`;
      resultString += stringifyTiebreakers(configuration.tiebreakers,
        sortedPlayers[i],
        forRound);
      resultString += '\n';
    }
  }

  return resultString;
}
