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

import Tournament, { Color, Configuration, Game, GameResult, Player } from '#/types/Tournament';
import { isAbsentFromRound } from '#/utils/GamesUtils';
import { computeRanks, detectHolesInIds } from '#/utils/TournamentUtils';

type PointsModFormat = 'JaVaFo' | 'bbpPairings';
export type ExportConfig = {
  tournament: Tournament,
  players: Player[],
  configuration: Configuration,
  forRound?: number;
  exportForPairing?: boolean;
  pointsModFormat?: PointsModFormat;
}

const nextRoundByes = [
  GameResult.ZERO_POINT_BYE,
  GameResult.HALF_POINT_BYE,
  GameResult.FULL_POINT_BYE,
  GameResult.FORFEIT_WIN,
  GameResult.FORFEIT_LOSS,
  GameResult.DRAW,
];

function isGameABye(game: Game): boolean {
  return game !== undefined
    && game.opponent === undefined
    && nextRoundByes.includes(game.result);
}

function stringifyGames(player: Player,
  toRound: number,
  includeNextRoundBye: boolean): string {
  const { games } = player;
  let string = '';

  const len = Math.min(games.length, toRound);
  for (let i = 0; i < len; ++i) {
    const { opponent } = games[i];
    string += '  ';
    string += (opponent !== undefined)
      ? (opponent).toString().padStart(4)
      : '    ';
    string += ` ${games[i].color} ${games[i].result}`;
  }

  if (includeNextRoundBye) {
    if (isGameABye(games[toRound])) {
      string += `       - ${games[toRound].result}`;
    } else if (isAbsentFromRound(player, toRound + 1)) {
      string += '       - Z';
    }
  }

  // Fill in spaces for non-existent rounds
  for (let i = games.length; i < toRound; ++i) {
    string += '          ';
  }

  return string;
}

function stringifyAccelerations(accelerations: number[]): string {
  let string = '';

  for (const acc of accelerations) {
    string += ` ${acc.toFixed(1).padStart(4)}`;
  }

  return string;
}

function exportTournamentInfo(tournament: Tournament): string {
  let string = '';

  tournament.tournamentName && (string += `012 ${tournament.tournamentName}\n`);
  tournament.city && (string += `022 ${tournament.city}\n`);
  tournament.federation && (string += `032 ${tournament.federation}\n`);
  tournament.dateOfStart && (string += `042 ${tournament.dateOfStart}\n`);
  tournament.dateOfEnd && (string += `052 ${tournament.dateOfEnd}\n`);
  tournament.numberOfPlayers && (string += `062 ${tournament.numberOfPlayers}\n`);
  tournament.numberOfRatedPlayers && (string += `072 ${tournament.numberOfRatedPlayers}\n`);
  tournament.numberOfTeams && (string += `082 ${tournament.numberOfTeams}\n`);
  tournament.tournamentType && (string += `092 ${tournament.tournamentType}\n`);
  tournament.chiefArbiter && (string += `102 ${tournament.chiefArbiter}\n`);
  tournament.deputyArbiters.length && (string += `112 ${tournament.deputyArbiters.join(' ')}\n`);
  tournament.rateOfPlay && (string += `122 ${tournament.rateOfPlay}\n`);
  tournament.roundDates.length && (string += `132 ${tournament.roundDates.join(' ')}\n`);

  return string;
}

function exportColorRankConfig(matchByRank: boolean, initialColor: Color) {
  let string = '';
  if (matchByRank) {
    string += ' rank';
  }
  if (initialColor !== Color.NONE) {
    string += initialColor === Color.WHITE
      ? ' white1'
      : ' black1';
  }

  return string !== '' ? `XXC${string}\n` : '';
}

function getPoints({ scores, games }: Player, exportForPairing: boolean, round: number) {
  if (exportForPairing && isGameABye(games[round])) {
    return scores[round].points;
  }

  if (round <= 0) {
    return 0;
  }
  return scores[round - 1].points;
}

function getConfigurationsString(configuration: Configuration, pointsModFormat: PointsModFormat) {
  let confStr = '';

  if (configuration.pointsForWin !== 1.0
    || configuration.pointsForDraw !== 0.5
    || configuration.pointsForLoss !== 0.0
    || configuration.pointsForZeroPointBye !== 0.0
    || configuration.pointsForForfeitLoss !== 0.0
    || configuration.pointsForPairingAllocatedBye !== 1.0) {
    if (configuration.pointsForWin > 99.9
      || configuration.pointsForDraw > 99.9
      || configuration.pointsForLoss > 99.9
      || configuration.pointsForZeroPointBye > 99.9
      || configuration.pointsForForfeitLoss > 99.9
      || configuration.pointsForPairingAllocatedBye > 99.9) {
      // FIXME Return error code instead
      return undefined;
    }
    let jvfStr = '';
    if (configuration.pointsForWin !== 1.0
      || configuration.pointsForDraw !== 0.5
      || configuration.pointsForLoss !== 0.0
      || configuration.pointsForZeroPointBye !== 0.0
      || configuration.pointsForForfeitLoss !== 0.0) {
      if (pointsModFormat === 'bbpPairings') {
        confStr += `BBW ${configuration.pointsForWin.toFixed(1)
          .padStart(4)}\n`;
        confStr += `BBD ${configuration.pointsForDraw.toFixed(1)
          .padStart(4)}\n`;
      } else {
        jvfStr += ` W=${configuration.pointsForWin}`;
        jvfStr += ` D=${configuration.pointsForDraw}`;
      }
    }
    if (configuration.pointsForLoss !== 0.0
      || configuration.pointsForZeroPointBye !== 0.0
      || configuration.pointsForForfeitLoss !== 0.0) {
      if (pointsModFormat === 'bbpPairings') {
        confStr += `BBL ${configuration.pointsForLoss.toFixed(1)
          .padStart(4)}\n`;
        confStr += `BBZ ${configuration.pointsForZeroPointBye.toFixed(1)
          .padStart(4)}\n`;
        confStr += `BBF ${configuration.pointsForForfeitLoss.toFixed(1)
          .padStart(4)}\n`;
      } else {
        jvfStr += ` WL=${configuration.pointsForLoss}`;
        jvfStr += ` BL=${configuration.pointsForLoss}`;
        jvfStr += ` ZPB=${configuration.pointsForZeroPointBye}`;
        jvfStr += ` FL=${configuration.pointsForForfeitLoss}`;
      }
    }
    if (configuration.pointsForPairingAllocatedBye !== 1.0) {
      if (pointsModFormat === 'bbpPairings') {
        confStr += `BBU ${configuration.pointsForPairingAllocatedBye.toFixed(1)
          .padStart(4)}\n`;
      } else {
        jvfStr += ` PAB=${configuration.pointsForForfeitLoss}`;
      }
    }

    if (jvfStr !== '') {
      confStr += `XXS${jvfStr}\n`;
    }
  }

  return confStr;
}

export default function exportToTrf({
  tournament,
  players,
  configuration,
  forRound = tournament.playedRounds,
  exportForPairing = true,
  pointsModFormat = 'JaVaFo'
}: ExportConfig): string | undefined {

  const { playedRounds } = tournament;
  let resultString = '';

  if (forRound < 0 || forRound > playedRounds) {
    forRound = playedRounds;
  }

  if (!exportForPairing) {
    resultString += exportTournamentInfo(tournament);
  }
  if (forRound < configuration.expectedRounds || exportForPairing) {
    resultString += `XXR ${configuration.expectedRounds}\n`;
  }
  if (exportForPairing) {
    resultString += exportColorRankConfig(configuration.matchByRank || detectHolesInIds(players),
      configuration.initialColor);
  }

  const { playersByRank } = computeRanks(players,
    configuration.tiebreakers, forRound);

  for (const player of players) {
    const {
      id,
      sex,
      title,
      name,
      rating,
      federation,
      fideNumber,
      birthDate,
    } = player;
    const points = getPoints(player, exportForPairing, forRound);

    if (id > 9999 || rating > 9999 || points > 99.9) {
      // FIXME Return error code instead
      return undefined;
    }
    resultString += `001 ${id.toString().padStart(4)} ${sex}${title.padStart(3)}`
      + ` ${name.padEnd(33)} ${rating.toString().padStart(4)} ${federation.padStart(3)}`
      + ` ${fideNumber.padStart(11)} ${birthDate.padEnd(10)} ${points.toFixed(1).padStart(4)}`
      + ` ${playersByRank[id].toString().padStart(4)}`;
    resultString += `${stringifyGames(player, forRound, exportForPairing)}\n`;
  }

  for (const player of players) {
    if (player.accelerations.length !== 0) {
      const { id, accelerations } = player;
      const acc = stringifyAccelerations(accelerations);
      resultString += `XXA ${id.toString().padStart(4)}${acc}\n`;
    }
  }

  resultString += getConfigurationsString(configuration, pointsModFormat);

  return resultString;
}
