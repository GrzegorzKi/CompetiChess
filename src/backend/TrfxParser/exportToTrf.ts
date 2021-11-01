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
    string += '  ';
    string += (games[i].opponent === playerId)
      ? '    '
      : (games[i].opponent + 1).toString().padStart(4);
    string += ` ${games[i].color} ${games[i].result}`;
  }

  if (includeNextRoundBye) {
    if (games[toRound] !== undefined
      && games[toRound].opponent === playerId
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
  let resultString = '';
  if (forRound < 0 || forRound > tournament.playedRounds) {
    // eslint-disable-next-line no-param-reassign
    forRound = tournament.playedRounds;
  }

  if (!exportForPairing) {
    resultString += exportTournamentInfo(tournament);
  }
  if (forRound < tournament.expectedRounds || exportForPairing) {
    resultString += `XXR ${tournament.expectedRounds}\n`;
  }
  if (exportForPairing) {
    resultString += exportColorRankConfig(tournament);
  }

  const playersByRank = tournament.computeRanks(forRound);

  function getPoints({ scores, games, playerId }: TrfPlayer) {
    if (games[forRound] !== undefined
      && games[forRound].opponent === playerId
      && nextRoundByes.includes(games[forRound].result)) {
      return scores[forRound].points;
    }
    if (forRound <= 0) {
      return 0;
    }
    return scores[forRound - 1].points;
  }

  for (let i = 0, len = tournament.players.length; i < len; ++i) {
    if (tournament.players[i] !== undefined) {
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
      } = tournament.players[i];
      const points = getPoints(tournament.players[i]);

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

    // TODO Export custom points configuration
  }

  return resultString;
}
