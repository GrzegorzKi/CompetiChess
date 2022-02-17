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

import Tournament, { Color, Game, GameResult, Player } from '#/types/Tournament';
import { isAbsentFromRound } from '#/utils/GamesUtils';
import { computeRanks } from '#/utils/TournamentUtils';

export type ExportConfig = {
  forRound?: number;
  exportForPairing?: boolean;
  pointsModFormat?: 'JaVaFo' | 'bbpPairings';
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
      ? (opponent + 1).toString().padStart(4)
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
    string += ` ${  acc.toFixed(1).padStart(4)}`;
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

function exportColorRankConfig({ configuration }: Tournament) {
  let string = '';
  if (configuration.matchByRank) {
    string += ' rank';
  }
  if (configuration.initialColor !== Color.NONE) {
    string += configuration.initialColor === Color.WHITE
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

export default function exportToTrf(tournament: Tournament, {
  forRound = tournament.playedRounds,
  exportForPairing = true,
  pointsModFormat = 'JaVaFo'
}: ExportConfig): string | undefined {

  const {
    playedRounds,
    players,
    playersByPosition,
    configuration
  } = tournament;
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
    resultString += exportColorRankConfig(tournament);
  }

  const { playersByRank } = computeRanks(tournament, forRound);

  const playersToIter = configuration.matchByRank
    ? playersByPosition
    : players;

  for (let i = 0, len = playersToIter.length; i < len; ++i) {
    if (playersToIter[i] !== undefined) {
      const {
        playerId,
        sex,
        title,
        name,
        rating,
        federation,
        id,
        birthDate,
      } = playersToIter[i];
      const points = getPoints(playersToIter[i], exportForPairing, forRound);

      if (playerId > 9999 || rating > 9999 || points > 99.9) {
        // FIXME Return error code instead
        return undefined;
      }
      resultString += `001 ${(playerId + 1).toString().padStart(4)} ${sex}${title.padStart(3)}`
        + ` ${name.padEnd(33)} ${rating.toString().padStart(4)} ${federation.padStart(3)}`
        + ` ${id.padStart(11)} ${birthDate.padEnd(10)} ${points.toFixed(1).padStart(4)}`
        + ` ${playersByRank[playerId].toString().padStart(4)}`;
      resultString += `${stringifyGames(playersToIter[i], forRound, exportForPairing)}\n`;
    }
  }

  for (let i = 0, len = players.length; i < len; ++i) {
    if (players[i] !== undefined
      && players[i].accelerations.length !== 0) {
      const { playerId, accelerations } = players[i];
      const acc = stringifyAccelerations(accelerations);
      resultString += `XXA ${(playerId + 1).toString().padStart(4)}${acc}\n`;
    }
  }

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
        resultString += `BBW ${configuration.pointsForWin.toFixed(1)
          .padStart(4)}\n`;
        resultString += `BBD ${configuration.pointsForDraw.toFixed(1)
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
        resultString += `BBL ${configuration.pointsForLoss.toFixed(1)
          .padStart(4)}\n`;
        resultString += `BBZ ${configuration.pointsForZeroPointBye.toFixed(1)
          .padStart(4)}\n`;
        resultString += `BBF ${configuration.pointsForForfeitLoss.toFixed(1)
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
        resultString += `BBU ${configuration.pointsForPairingAllocatedBye.toFixed(1)
          .padStart(4)}\n`;
      } else {
        jvfStr += ` PAB=${configuration.pointsForForfeitLoss}`;
      }
    }

    if (jvfStr !== '') {
      resultString += `XXS ${jvfStr}\n`;
    }
  }

  return resultString;
}
