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

import TournamentData from '../types/TournamentData';
import {
  Color, GameResult, TrfGame, TrfPlayer
} from '../types/TrfFileFormat';

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

function stringifyGames(games: TrfGame[],
  playerId: number,
  toRound: number,
  includeNextRoundBye: boolean): string {
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
    if (games[toRound] !== undefined
      && games[toRound].opponent === undefined
      && nextRoundByes.includes(games[toRound].result)) {
      string += `       - ${games[toRound].result}`;
    }
  }

  // Fill in spaces for non-existent rounds
  for (let i = games.length; i < toRound; ++i) {
    string += '          ';
  }

  return string;
}

function stringifyAccelerations(arr: number[]): string {
  let string = '';
  for (let i = 0; i < arr.length; ++i) {
    string += ' ';
    string += arr[i].toFixed(1).padStart(4);
  }

  return string;
}

function exportTournamentInfo(tournament: TournamentData): string {
  let string = '';
  if (tournament.tournamentName !== '') {
    string += `012 ${tournament.tournamentName}\n`;
  }
  if (tournament.city !== '') {
    string += `022 ${tournament.city}\n`;
  }
  if (tournament.federation !== '') {
    string += `032 ${tournament.federation}\n`;
  }
  if (tournament.dateOfStart !== '') {
    string += `042 ${tournament.dateOfStart}\n`;
  }
  if (tournament.dateOfEnd !== '') {
    string += `052 ${tournament.dateOfEnd}\n`;
  }
  if (tournament.numberOfPlayers > 0) {
    string += `062 ${tournament.numberOfPlayers}\n`;
  }
  if (tournament.numberOfRatedPlayers > 0) {
    string += `072 ${tournament.numberOfRatedPlayers}\n`;
  }
  if (tournament.numberOfTeams > 0) {
    string += `082 ${tournament.numberOfTeams}\n`;
  }
  if (tournament.tournamentType !== '') {
    string += `092 ${tournament.tournamentType}\n`;
  }
  if (tournament.chiefArbiter !== '') {
    string += `102 ${tournament.chiefArbiter}\n`;
  }
  if (tournament.deputyArbiters.length > 0) {
    string += `112 ${tournament.deputyArbiters.join(' ')}\n`;
  }
  if (tournament.rateOfPlay !== '') {
    string += `122 ${tournament.rateOfPlay}\n`;
  }
  if (tournament.roundDates.length > 0) {
    string += `132 ${tournament.roundDates.join(' ')}\n`;
  }

  return string;
}

function exportColorRankConfig({ configuration }: TournamentData) {
  let string = '';
  if (configuration.matchByRank) {
    string += ' rank';
  }
  if (configuration.initialColor !== Color.NONE) {
    string += configuration.initialColor === Color.WHITE
      ? ' white1'
      : ' black1';
  }
  if (string !== '') {
    return `XXC${string}\n`;
  }
  return '';
}

export default function exportToTrf(tournament: TournamentData, {
  forRound = tournament.playedRounds,
  exportForPairing = true,
  pointsModFormat = 'JaVaFo'
}: ExportConfig): string | undefined {
  function getPoints({ scores, games }: TrfPlayer) {
    if (exportForPairing) {
      if (games[forRound] !== undefined
        && games[forRound].opponent === undefined
        && nextRoundByes.includes(games[forRound].result)) {
        return scores[forRound].points;
      }
    }

    if (forRound <= 0) {
      return 0;
    }
    return scores[forRound - 1].points;
  }

  const {
    playedRounds,
    expectedRounds,
    players,
    playersByPosition,
    configuration
  } = tournament;
  let resultString = '';

  if (forRound < 0 || forRound > playedRounds) {
    // eslint-disable-next-line no-param-reassign
    forRound = playedRounds;
  }

  if (!exportForPairing) {
    resultString += exportTournamentInfo(tournament);
  }
  if (forRound < expectedRounds || exportForPairing) {
    resultString += `XXR ${expectedRounds}\n`;
  }
  if (exportForPairing) {
    resultString += exportColorRankConfig(tournament);
  }

  const { playersByRank } = tournament.computeRanks(forRound);

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
        games,
      } = playersToIter[i];
      const points = getPoints(playersToIter[i]);

      if (playerId > 9999 || rating > 9999 || points > 99.9) {
        // FIXME Return error code instead
        return undefined;
      }
      resultString += `001 ${(playerId + 1).toString().padStart(4)} ${sex}${title.padStart(3)}`
        + ` ${name.padEnd(33)} ${rating.toString().padStart(4)} ${federation.padStart(3)}`
        + ` ${id.padStart(11)} ${birthDate.padEnd(10)} ${points.toFixed(1).padStart(4)}`
        + ` ${playersByRank[playerId].toString().padStart(4)}`;
      resultString += `${stringifyGames(games, playerId, forRound, exportForPairing)}\n`;
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
