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

import Tiebreaker from '#/types/Tiebreaker';
import {
  Color,
  Configuration,
  Game,
  GameResult,
  Player,
  PlayersRecord,
  TiebreakersPoints,
} from '#/types/Tournament';
import { gameWasPlayed, isUnplayedDraw, isUnplayedWin } from '#/utils/GamesUtils';
import { numberComparator } from '#/utils/SortUtils';
import { calculatePoints, getPoints } from '#/utils/TournamentUtils';

function calculateVirtualOpponentScore(
  configuration: Configuration,
  game: Game,
  initialPoints: number,
  forRound: number,
  notPlayedIsDraw = false
): number {
  let vPoints = initialPoints;
  vPoints += (configuration.pointsForWin - getPoints(game, configuration, notPlayedIsDraw));
  vPoints += 0.5 * (forRound - (game.round - 1));
  return vPoints;
}

function calcCumulativeCut(roundsCut: number): CalcFunction {
  return ({ games, scores }: Player, forRound, _, configuration): number => {
    const len = Math.min(games.length, forRound);

    let calcPts = 0.0;
    for (let r = roundsCut; r < len; ++r) {
      calcPts += scores[r].points;
      if (isUnplayedWin(games[r]) || isUnplayedDraw(games[r])) {
        calcPts -= getPoints(games[r], configuration);
      }
    }

    return calcPts;
  };
}

// TODO Remove this tiebreaker as it is too heavy for calculations
const calcOppositionCumulative: CalcFunction = (
  player, forRound, players, configuration): number => {

  const { games, id } = player;
  const round = Math.min(games.length, forRound);

  let calcCumul = 0.0;
  for (let r = 0; r < round; ++r) {
    const opponent = games[r].opponent ?? id;

    // Always calculate cumulative tiebreaker first
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const cumulValue = calculateValue(
      Tiebreaker.CUMULATIVE,
      players[opponent],
      forRound,
      configuration,
      players,
    );

    calcCumul += cumulValue;
  }

  return calcCumul;
};

function calcProgressiveCut(roundsCut: number): CalcFunction {
  return (player: Player, forRound): number => {
    const { games, scores } = player;
    const len = Math.min(games.length, forRound);

    let calcPts = 0.0;
    for (let i = roundsCut; i < len; ++i) {
      calcPts += scores[i].points;
    }

    return calcPts;
  };
}

const calcRoundsWon: CalcFunction = (
  { games }: Player, forRound): number => {

  let roundsWon = 0;
  const len = Math.min(games.length, forRound);
  for (let i = 0; i < len; ++i) {
    const { result, opponent } = games[i];
    if (opponent !== undefined && (result === '1' || result === 'W' || result === '+')) {
      roundsWon += 1;
    }
  }
  return roundsWon;
};

const calcRoundsWonBlackPieces: CalcFunction = (
  { games }: Player, forRound): number => {

  let roundsWon = 0;

  const len = Math.min(games.length, forRound);
  for (let i = 0; i < len; ++i) {
    const { color, result, opponent } = games[i];
    if (opponent !== undefined && color === Color.BLACK && (result === '1' || result === 'W')) {
      roundsWon += 1;
    }
  }
  return roundsWon;
};

const calcTimeOfLoss: CalcFunction = (
  { games }: Player, forRound): number => {

  const len = Math.min(games.length, forRound);

  for (let round = 0; round < len; ++round) {
    const { result } = games[round];
    if (result === '0' || result === 'L' || result === '-' || result === 'Z') {
      return round + 1;
    }
  }

  return len + 1;
};

const calcGamesWithBlack: CalcFunction = (
  { games }: Player, forRound): number => {

  let roundsBlack = 0;
  const len = Math.min(games.length, forRound);

  for (let round = 0; round < len; ++round) {
    if (gameWasPlayed(games[round]) && games[round].color === Color.BLACK) {
      roundsBlack += 1;
    }
  }

  return roundsBlack;
};

const calcKashdan: CalcFunction = (
  { games }: Player, forRound): number => {

  let calcPts = 0;
  const len = Math.min(games.length, forRound);

  for (let r = 0; r < len; ++r) {
    if (gameWasPlayed(games[r])) {
      const { result } = games[r];
      if (result === '1' || result === 'W') {
        calcPts += 4;
      } else if (result === '=' || result === 'D') {
        calcPts += 2;
      } else if (result === '0' || result === 'L') {
        calcPts += 1;
      }
    }
  }

  return calcPts;
};

const calcSonnebornBerger: CalcFunction = (
  { games, scores }: Player, forRound, players, configuration): number => {

  let calcPts = 0;
  const len = Math.min(games.length, forRound);

  for (let r = 0; r < len; ++r) {
    const { opponent, result } = games[r];
    if (gameWasPlayed(games[r])) {
      if (result === '1' || result === 'W') {
        calcPts += calculatePoints(forRound, players[opponent!].games, configuration);
      } else if (result === '=' || result === 'D') {
        calcPts += (calculatePoints(forRound, players[opponent!].games, configuration) * 0.5);
      }
    } else {
      calcPts += calculateVirtualOpponentScore(
        configuration,
        games[r],
        scores[r].points,
        forRound);
    }
  }

  return calcPts;
};

const calcModifiedMedian: CalcFunction = (
  { games, scores }: Player, forRound, players, configuration): number => {

  const halfMaxPoints = (configuration.pointsForWin * forRound) / 2;
  const len = Math.min(games.length, forRound);
  const opScores: number[] = [];

  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (gameWasPlayed(games[r])) {
      opScores.push(calculatePoints(forRound, players[opponent!].games, configuration));
    }
    // If the player involved in the tie has any unplayed games,
    // they count as opponents with adjusted scores of 0.
  }

  opScores.sort(numberComparator);

  function getRange() {
    const cutAmount = (len >= 9) ? 2 : 1;
    if (scores[forRound - 1].points > halfMaxPoints) {
      return { low: cutAmount, high: opScores.length };
    }
    if (scores[forRound - 1].points < halfMaxPoints) {
      return { low: 0, high: opScores.length - cutAmount };
    }
    return { low: cutAmount, high: opScores.length - cutAmount };
  }

  const range = getRange();

  // Calculate Median-Buchholz by excluding the highest and the lowest scores
  let calcPts = 0;
  for (let i = range.low; i < range.high; ++i) {
    calcPts += opScores[i];
  }

  return calcPts;
};

const calcSolkoff: CalcFunction = (
  { games }: Player, forRound, players, configuration): number => {

  const len = Math.min(games.length, forRound);
  let calcPts = 0;

  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (gameWasPlayed(games[r])) {
      calcPts += calculatePoints(forRound, players[opponent!].games, configuration);
    }
    // If the player involved in the tie has any unplayed games,
    // they count as opponents with adjusted scores of 0.
  }

  return calcPts;
};

const calcBuchholz: CalcFunction = (
  { games, scores }: Player, forRound, players, configuration): number => {

  const len = Math.min(games.length, forRound);
  let calcPts = 0;

  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (gameWasPlayed(games[r])) {
      calcPts += calculatePoints(forRound, players[opponent!].games, configuration);
    } else {
      calcPts += calculateVirtualOpponentScore(
        configuration,
        games[r],
        scores[r].points,
        forRound);
    }
  }

  return calcPts;
};

const calcMedianBuchholz: CalcFunction = (
  { games, scores }: Player, forRound, players, configuration): number => {

  const len = Math.min(games.length, forRound);
  const opScores: number[] = [];

  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (gameWasPlayed(games[r])) {
      opScores.push(calculatePoints(forRound, players[opponent!].games, configuration));
    } else {
      opScores.push(calculateVirtualOpponentScore(
        configuration,
        games[r],
        scores[r].points,
        forRound));
    }
  }

  opScores.sort(numberComparator);

  // Calculate Median-Buchholz by excluding the highest and the lowest scores
  let calcPts = 0;
  for (let i = 1, sLen = opScores.length - 1; i < sLen; ++i) {
    calcPts += opScores[i];
  }
  return calcPts;
};

const calcBuchholzCutOne: CalcFunction = (
  { games, scores }: Player, forRound, players, configuration): number => {
  const len = Math.min(games.length, forRound);
  let calcPts = 0;
  let lowestScore = Infinity;

  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (gameWasPlayed(games[r])) {
      const opPoints = calculatePoints(forRound, players[opponent!].games, configuration);
      calcPts += opPoints;
      if (opPoints < lowestScore) {
        lowestScore = opPoints;
      }
    } else {
      const opPoints = calculateVirtualOpponentScore(
        configuration,
        games[r],
        scores[r].points,
        forRound);
      calcPts += opPoints;
      if (opPoints < lowestScore) {
        lowestScore = opPoints;
      }
    }
  }

  return calcPts > 0 ? calcPts - lowestScore : 0;
};

const calcAvgRatingOfOpposition: CalcFunction = (
  { games }: Player, forRound, players): number => {
  let sumRating = 0;
  let roundsPlayed = 0;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (opponent !== undefined) {
      sumRating += players[opponent].rating;
      roundsPlayed += 1;
    }
  }

  return roundsPlayed !== 0 ? Math.floor(sumRating / roundsPlayed) : 0;
};

const calcAvgRatingOfOpponentsCutOne: CalcFunction = (
  { games }: Player, forRound: number, players): number => {
  let sumRating = 0;
  let roundsPlayed = 0;
  let hadBye = false;
  let lowestRating = Infinity;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    // We cut forfeits and byes from calculations, according to FIDE regulations
    if (gameWasPlayed(games[r])) {
      const opRating = players[opponent!].rating;
      sumRating += opRating;
      roundsPlayed += 1;
      if (opRating < lowestRating) {
        lowestRating = opRating;
      }
    } else {
      hadBye = true;
    }
  }

  // If a player has one or more forfeits or byes, then no additional
  // results are to be cut from the calculation of AROC 1
  if (!hadBye) {
    sumRating -= lowestRating;
    roundsPlayed -= 1;
  }

  return roundsPlayed > 0 ? Math.floor(sumRating / roundsPlayed) : 0;
};

const calcOppositionPerformance: CalcFunction = (
  { games }: Player, forRound: number, players): number => {
  let sumRating = 0;
  let roundsPlayed = 0;

  const len = Math.min(games.length, forRound);
  for (let r = 0; r < len; ++r) {
    const { opponent, result } = games[r];
    if (opponent !== undefined) {
      sumRating += players[opponent].rating;
      if (result === GameResult.WIN
        || result === GameResult.UNRATED_WIN
        || result === GameResult.FORFEIT_WIN) {
        sumRating += 400;
      } else if (result === GameResult.LOSS
        || result === GameResult.UNRATED_LOSS
        || result === GameResult.FORFEIT_LOSS) {
        sumRating -= 400;
      }
      roundsPlayed += 1;
    }
  }

  return roundsPlayed !== 0 ? Math.floor(sumRating / roundsPlayed) : 0;
};

const calcKoyaSystem: CalcFunction = (
  { games }, forRound, players, configuration): number => {
  const halfMaxPoints = (configuration.pointsForWin * forRound) / 2;
  const len = Math.min(games.length, forRound);
  let calcPts = 0;

  for (let r = 0; r < len; ++r) {
    const { opponent } = games[r];
    if (opponent !== undefined) {
      const opPoints = players[opponent].scores[forRound - 1].points;

      if (opPoints >= halfMaxPoints) {
        calcPts += getPoints(games[r], configuration);
      }
    }
  }

  return calcPts;
};

// There is no calculating function for head-to-head.
// It must be handled on per-pair basis.
export function compareHeadToHead(first: Player, second: Player): number {
  const index = first.games.findIndex((game) => game.opponent === second.id);
  if (index === -1) {
    return 0;
  }

  const { result: p1Result } = first.games[index];
  const { result: p2Result } = second.games[index];
  // Checking for won match only, forfeit by win shouldn't be considered
  if (p1Result === '1' || p1Result === 'W') {
    return -1;
  }
  if (p2Result === '1' || p2Result === 'W') {
    return 1;
  }

  return 0;
}

export type TiebreakerInfo = {
  key: Tiebreaker,
  abbr: string,
  name: string,
  description: string,
  calculate: CalcFunction,
  decimalPlaces?: number,
};

type CalcFunction = (player: Player, forRound: number, players: PlayersRecord, configuration: Configuration) => number;

export const tiebreakers: Record<Tiebreaker, TiebreakerInfo> = {
  [Tiebreaker.DIRECT_ENCOUNTER]: {
    key: Tiebreaker.DIRECT_ENCOUNTER,
    abbr: 'DirEn',
    name: 'Bezpośrednia konfrontacja',
    description: `System rozstrzygania remisów między zawodnikami. Jeżeli
dwoje graczy grało ze sobą, sprawdzany jest wynik meczu. Wyżej w rankingu
znajdzie się osoba, która wygrała w tej parze.`,
    calculate: () => 0,
    decimalPlaces: 0
  } as const,

  [Tiebreaker.CUMULATIVE]: {
    key: Tiebreaker.CUMULATIVE,
    abbr: 'Cumul',
    name: 'Kumulacyjny',
    description: `Obliczana jest suma punktów posiadanych przez gracza
w kolejnych rundach. Ewentualne niegrane partie (np. przez walkower,
nieobecność, z wyjątkiem pauzy) obniżają dodawane punkty o wartość udzielonych
w tej partii punktów.

Przykładowo: jeżeli na końcu rundy trzeciej zawodnik posiada trzy punkty
i wygrał tę rundę walkowerem, przy dodawaniu punktów do punktacji pomocniczej
zostaną dodane tylko DWA punkty, a nie trzy za tę rundę.`,
    calculate: calcCumulativeCut(0)
  } as const,

  [Tiebreaker.CUMULATIVE_CUT_1]: {
    key: Tiebreaker.CUMULATIVE_CUT_1,
    abbr: 'Cuml1',
    name: 'Kumulacyjny zredukowany 1',
    description: `Obliczana jest suma punktów posiadanych przez gracza
w kolejnych rundach. Identycznie do p. pomocniczej "Kumulacyjny", z odrzuceniem
pierwszej rundy w obliczeniach.`,
    calculate: calcCumulativeCut(1)
  } as const,

  [Tiebreaker.OPPOSITION_CUMULATIVE]: {
    key: Tiebreaker.OPPOSITION_CUMULATIVE,
    abbr: 'OpCuml',
    name: 'Kumulacyjny przeciwników',
    description: `Dla każdego przeciwnika, z którym grał zawodnik, obliczana
jest jego punktacja pomocnicza "Kumulacyjny" (sposób obliczania przedstawiono
w opisie p. pomocniczej "Kumulacyjny"). Suma tych punktacji stanowi punktację
pomocniczą "Kumulacyjny przeciwników".

Stosowana jest m.in. przez Federację Szachową Stanów Zjednoczonych jako czwartą
w kolejności używaną punktację pomocniczą.`,
    calculate: calcOppositionCumulative
  } as const,

  [Tiebreaker.PROGRESSIVE]: {
    key: Tiebreaker.PROGRESSIVE,
    abbr: 'Prog',
    name: 'Progres',
    description: `Obliczana jest suma punktów posiadanych przez gracza
w kolejnych rundach. W porównaniu do punktacji pomocniczej "Kumulacyjny",
ewentualne niegrane partie (np. przez walkower czy nieobecność) nie obniżają
łącznej ilości punktów.`,
    calculate: calcProgressiveCut(0)
  } as const,

  [Tiebreaker.PROGRESSIVE_CUT_1]: {
    key: Tiebreaker.PROGRESSIVE_CUT_1,
    abbr: 'Prog',
    name: 'Progres zredukowany 1',
    description: `Obliczana jest suma punktów posiadanych przez gracza
w kolejnych rundach. Identycznie do p. pomocniczej "Progress", z odrzuceniem
pierwszej rundy w obliczeniach.`,
    calculate: calcProgressiveCut(1)
  } as const,

  [Tiebreaker.ROUNDS_WON]: {
    key: Tiebreaker.ROUNDS_WON,
    abbr: 'RWon',
    name: 'Wygrane rundy',
    description: `Obliczana jest liczba wygranych przez gracza rund,
niezależnie od tego, czy przez walkower bądź wygraną partię.`,
    calculate: calcRoundsWon,
    decimalPlaces: 0
  } as const,

  [Tiebreaker.ROUNDS_WON_BLACK_PIECES]: {
    key: Tiebreaker.ROUNDS_WON_BLACK_PIECES,
    abbr: 'RWnB',
    name: 'Wygrane rundy czarnymi',
    description: `Obliczana jest liczba wygranych przez gracza rund, grając
czarnymi. Niegrana partia (przez walkower) liczy się jako partia grana białymi,
wobec czego nie wlicza się do punktacji.`,
    calculate: calcRoundsWonBlackPieces,
    decimalPlaces: 0
  } as const,

  [Tiebreaker.TIME_OF_LOSS]: {
    key: Tiebreaker.TIME_OF_LOSS,
    abbr: 'TmOL',
    name: 'Czas do pierwszej przegranej',
    description: `Obliczana jest runda, w której zawodnik przegrał, przegrał
walkowerem albo nie grał rundy poprzez otrzymanie zera punktów, tzw. Zero Point
Bye. Pauza wynikająca z braku przeciwnika do pary nie jest brana pod uwagę.`,
    calculate: calcTimeOfLoss,
    decimalPlaces: 0
  } as const,

  [Tiebreaker.PLAYED_BLACKS]: {
    key: Tiebreaker.PLAYED_BLACKS,
    abbr: 'Blks',
    name: 'Rundy grane czarnymi',
    description: 'Obliczana jest ilość rund granych czarnymi bierkami.',
    calculate: calcGamesWithBlack,
    decimalPlaces: 0
  } as const,

  [Tiebreaker.KASHDAN]: {
    key: Tiebreaker.KASHDAN,
    abbr: 'Kash',
    name: 'Kashdan',
    description: `Stworzona przez Isaac'a Kashdan'a. System przydziela cztery
punkty za wygraną, dwa punkty za remis i jeden punkt za przegraną. Niegrane
partie (walkower, pauza, nieobecność) liczą się jako zero punktów.`,
    calculate: calcKashdan
  } as const,

  [Tiebreaker.SONNEBORN_BERGER]: {
    key: Tiebreaker.SONNEBORN_BERGER,
    abbr: 'SoBe',
    name: 'Sonneborn-Berger',
    description: `Ten system został nazwany od osób William'a Sonneborn'a oraz
Johann'a Berger'a, lecz wynaleziony przez Oscar'a Gelbfuhs'a. Również nazywany
punktacją Neustadtl'a.

System sumuje punkty przeciwników, z którymi zawodnik wygrał, oraz połowę
punktów przeciwników, z którymi zremisował.

W przypadku obliczania punktów przeciwników, partie niegrane przez przeciwnika
są liczone jako partie zremisowane (przyznaje się 1/2 punktu).

W przypadku partii niegranych przez zawodnika, obliczany jest tzw. wirtualny
przeciwnik. Dokładny sposób obliczania znajduje się w regulacjach FIDE
(C.02. Standards of Chess Equipment, venue for FIDE Tournaments, rate of play
and tie-break regulations, pkt. 13.15.3.) oraz dokumentacji użytkowej.`,
    calculate: calcSonnebornBerger
  } as const,

  [Tiebreaker.BUCHHOLZ]: {
    key: Tiebreaker.BUCHHOLZ,
    abbr: 'Buch',
    name: 'Buchholz',
    description: `System stworzony przez Bruno Buchholz'a, dedykowany turniejom
prowadzonym w systemie szwajcarskim. Stosowany najczęściej w turniejach, gdzie
zastosowanie mają regulacje turniejowe Międzynarodowej Federacji Szachowej (FIDE).

System sumuje punkty przeciwników, z którymi zawodnik grał.

W przypadku obliczania punktów przeciwników, partie niegrane przez przeciwnika
są liczone jako partie zremisowane (przyznaje się 1/2 punktu).

W przypadku partii niegranych przez zawodnika, obliczany jest tzw. wirtualny
przeciwnik. Dokładny sposób obliczania znajduje się w regulacjach FIDE
(C.02. Standards of Chess Equipment, venue for FIDE Tournaments, rate of play
and tie-break regulations, pkt. 13.15.3.) oraz dokumentacji użytkowej.`,
    calculate: calcBuchholz
  } as const,

  [Tiebreaker.BUCHHOLZ_CUT_1]: {
    key: Tiebreaker.BUCHHOLZ_CUT_1,
    abbr: 'Bch1',
    name: 'Buchholz zredukowany 1',
    description: `System stworzony przez Bruno Buchholz'a, dedykowany turniejom
prowadzonym w systemie szwajcarskim. Stosowany najczęściej w turniejach, gdzie
zastosowanie mają regulacje turniejowe Międzynarodowej Federacji Szachowej (FIDE).

Sposób obliczania identyczny jak w p. pomocniczej "Buchholz", z odrzuceniem
przeciwnika, który zdobył najmniejszą liczbą punktów.`,
    calculate: calcBuchholzCutOne
  } as const,

  [Tiebreaker.MEDIAN_BUCHHOLZ]: {
    key: Tiebreaker.MEDIAN_BUCHHOLZ,
    abbr: 'MBch',
    name: 'Median Buchholz 1',
    description: `System stworzony przez Bruno Buchholz'a, dedykowany turniejom
prowadzonym w systemie szwajcarskim. Stosowany najczęściej w turniejach, gdzie
zastosowanie mają regulacje turniejowe Międzynarodowej Federacji Szachowej (FIDE).

Sposób obliczania identyczny jak w p. pomocniczej "Buchholz", z odrzuceniem
rezultatów skrajnych, czyli przeciwników, którzy zdobyli najmniejszą
i największą liczbę punktów.`,
    calculate: calcMedianBuchholz
  } as const,

  [Tiebreaker.SOLKOFF]: {
    key: Tiebreaker.SOLKOFF,
    abbr: 'SOff',
    name: 'Solkoff',
    description: `Obliczana jest suma punktów zdobytych przez przeciwników
gracza. System jest podobny do systemu "Buchholz", z tą różnicą, że za partie
niegrane przez zawodnika przyznaje się zero punktów.

W przypadku obliczania punktów przeciwników, partie niegrane przez przeciwnika
są liczone jako partie zremisowane (przyznaje się 1/2 punktu).`,
    calculate: calcSolkoff
  } as const,

  [Tiebreaker.MODIFIED_MEDIAN]: {
    key: Tiebreaker.MODIFIED_MEDIAN,
    abbr: 'ModM',
    name: 'Zmodyfikowana mediana',
    description: `Odmiana systemu "Median Buchholz". Stanowi wariant mieszany.
W systemie "Mediana" odrzucane są skrajne wyniki obliczonych sum punktów
przeciwników w przypadku turniejów z liczbą rund mniejszą od 9. Jeśli jest 9
rund lub więcej, odrzuca się dwa skrajne wyniki.

Za partie niegrane przez zawodnika przyznaje się zero punktów.

W przypadku obliczania punktów przeciwników, partie niegrane przez przeciwnika
są liczone jako partie zremisowane (przyznaje się 1/2 punktu).

System zmodyfikowanej mediany jest podobna do systemu mediany, z wyjątkiem:
- Gracze z wynikiem dokładnie 50% są traktowani jak w zwykłym systemie mediany,
- Gracze z wynikiem powyżej 50% odrzucają tylko wynik przeciwnika, który
  uzyskał najniższy wynik,
- Gracze z wynikiem mniejszym niż 50% odrzucają tylko wynik przeciwnika, który
  uzyskał najwyższy wynik.`,
    calculate: calcModifiedMedian
  },

  [Tiebreaker.ARO]: {
    key: Tiebreaker.ARO,
    abbr: 'ARO',
    name: 'Średni ranking przeciwników',
    description: `Obliczana jest suma rankingów przeciwników zawodnika,
dzielona przez liczbę granych partii. Uwaga: System uwzględnia partie
zakończone walkowerem.`,
    calculate: calcAvgRatingOfOpposition,
    decimalPlaces: 0
  },

  [Tiebreaker.AROC_1]: {
    key: Tiebreaker.AROC_1,
    abbr: 'ARO1',
    name: 'Średni ranking przeciwników zredukowany 1',
    description: `Obliczana jest suma rankingów przeciwników zawodnika,
dzielona przez liczbę granych partii, z odrzuceniem najmniejszego z rankingów
przeciwników. Partie niegrane, w tym walkowery, nie są uwzględniane
w obliczeniach.

Jeżeli gracz pauzował, posiada partię zakończoną walkowerem albo nie grał
dowolnej z partii, to nie są odrzucane żadne rankingi.`,
    calculate: calcAvgRatingOfOpponentsCutOne,
    decimalPlaces: 0
  },

  [Tiebreaker.OPPOSITION_PERFORMANCE]: {
    key: Tiebreaker.OPPOSITION_PERFORMANCE,
    abbr: 'OpPf',
    name: 'Średnia siła przeciwników',
    description: `System zbliżony do "Średni ranking przeciwników", z tą
różnicą, że partie wygrane dodają dodatkowo 400 punktów do obliczeń, a partie
przegrane odejmują 400 punktów.`,
    calculate: calcOppositionPerformance,
    decimalPlaces: 0
  },

  [Tiebreaker.KOYA]: {
    key: Tiebreaker.KOYA,
    abbr: 'Koya',
    name: 'System Koya',
    description: `System przeznaczony dla turniejów w systemie Round Robin.
Obliczana jest suma punktów uzyskana przeciwko przeciwnikom, którzy osiągnęli
wynik powyżej 50% wszystkich punktów.`,
    calculate: calcKoyaSystem
  }
};

export function calculateValue(
  tiebreaker: Tiebreaker,
  player: Player,
  forRound: number,
  configuration: Configuration,
  players: PlayersRecord
): number {
  return tiebreakers[tiebreaker].calculate(player, forRound, players, configuration);
}

export function calculateTiebreakers(
  player: Player,
  forRound: number,
  configuration: Configuration,
  players: PlayersRecord,
): TiebreakersPoints {
  const tbValues: TiebreakersPoints = Object.create(null);

  for (const tb of configuration.tiebreakers) {
    tbValues[tb] = calculateValue(tb, player, forRound, configuration, players);
  }

  return tbValues;
}
