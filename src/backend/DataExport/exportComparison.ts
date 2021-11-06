import Tiebreaker from '../types/Tiebreaker';
import TournamentData from '../types/TournamentData';
import { TrfPlayer } from '../types/TrfFileFormat';

function stringifyTiebreakers(tbList: Tiebreaker[],
  { games, scores }: TrfPlayer,
  forRound: number): string {
  let string = '';

  const round = Math.max(Math.min(games.length, forRound) - 1, 0);
  for (let i = 0; i < tbList.length; ++i) {
    const value = scores[round].tiebreakers[tbList[i]] ?? 0;
    const fractionDigits = (tbList[i] === Tiebreaker.ARO
      || tbList[i] === Tiebreaker.AROC_1
      || tbList[i] === Tiebreaker.OPPOSITION_PERFORMANCE)
      ? 0
      : 1;
    string += ' ';
    string += value.toFixed(fractionDigits).padStart(tbList[i].length);
  }
  return string;
}

function createHeader(tbList: Tiebreaker[]) {
  let string = '  Id  Pts Rank |';
  for (let i = 0; i < tbList.length; ++i) {
    string += ' ';
    string += tbList[i];
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
      const { playerId } = sortedPlayers[i].player;
      const points = getPoints(sortedPlayers[i].player);

      if (playerId > 9999 || points > 99.9) {
        // FIXME Return error code instead
        return '';
      }
      resultString += `${(playerId + 1).toString().padStart(4)} ${points.toFixed(1).padStart(4)} ${playersByRank[playerId].toString().padStart(4)} |`;
      resultString += stringifyTiebreakers(configuration.tiebreakers,
        sortedPlayers[i].player,
        forRound);
      resultString += '\n';
    }
  }

  return resultString;
}
