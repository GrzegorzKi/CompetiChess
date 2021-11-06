import Tiebreaker from './Tiebreaker';

/*
  Tiebreak rules used by USCF Swiss tournaments. Described by paragraph:
  34E. Calculating Swiss tiebreaks.
  <br/>
  Last checked: November 2021
  <br/>
  @link https://web.archive.org/web/20211103174613/https://new.uschess.org/sites/default/files/media/documents/us-chess-rule-book-online-only-edition-chapters-1-2-9-10-11-8-23-21.pdf
 */
export const USCFSwiss = [
  Tiebreaker.MODIFIED_MEDIAN,
  Tiebreaker.SOLKOFF,
  Tiebreaker.CUMULATIVE,
  Tiebreaker.OPPOSITION_CUMULATIVE
] as const;

/*
  Tiebreak rules used by Madison City Chess League Swiss tournaments.
  <br/>
  Last checked: November 2021
  <br/>
  @link https://web.archive.org/web/20211103095321/https://madisonchess.com/tiebreakrules
 */
export const MadisonCityChessLeagueSwiss = [
  // Tiebreaker.MODIFIED_MEDIAN,
  Tiebreaker.CUMULATIVE,
  Tiebreaker.SOLKOFF,
  Tiebreaker.OPPOSITION_CUMULATIVE
] as const;

/*
  Tiebreak rules used by Madison City Chess League Round-Robin tournaments.
  <br/>
  Last checked: November 2021
  <br/>
  @link https://web.archive.org/web/20211103095321/https://madisonchess.com/tiebreakrules
 */
export const MadisonCityChessLeagueRoundRobin = [
  Tiebreaker.SONNEBORN_BERGER,
  Tiebreaker.DIRECT_ENCOUNTER,
] as const;

/*
  Tiebreak rules used by FIDE Swiss tournaments. Described by paragraph:
  13.16.4. Individual Swiss Tournaments where not all the ratings are consistent.
  <br/>
  Last checked: November 2021
  <br/>
  @link https://web.archive.org/web/20210824213036/https://handbook.fide.com/files/handbook/C02Standards.pdf
 */
export const FideSwissRatingsNotConsistent = [
  Tiebreaker.BUCHHOLZ_CUT_1,
  Tiebreaker.BUCHHOLZ,
  Tiebreaker.SONNEBORN_BERGER,
  Tiebreaker.PROGRESSIVE,
  Tiebreaker.DIRECT_ENCOUNTER,
  Tiebreaker.ROUNDS_WON,
  Tiebreaker.ROUNDS_WON_BLACK_PIECES
] as const;

/*
  Tiebreak rules used by FIDE Swiss tournaments. Described by paragraph:
  13.16.5. Individual Swiss Tournaments where all the ratings are consistent.
  <br/>
  Last checked: November 2021
  <br/>
  @link https://web.archive.org/web/20210824213036/https://handbook.fide.com/files/handbook/C02Standards.pdf
 */
export const FideSwissRatingsConsistent = [
  Tiebreaker.BUCHHOLZ_CUT_1,
  Tiebreaker.BUCHHOLZ,
  Tiebreaker.DIRECT_ENCOUNTER,
  Tiebreaker.AROC_1,
  Tiebreaker.ROUNDS_WON,
  Tiebreaker.ROUNDS_WON_BLACK_PIECES,
  Tiebreaker.PLAYED_BLACKS,
  Tiebreaker.SONNEBORN_BERGER
] as const;

/*
  Tiebreak rules used by FIDE Round-Robin tournaments. Described by paragraph:
  13.16.2. Individual Round-Robin Tournaments.
  <br/>
  Last checked: November 2021
  <br/>
  @link https://web.archive.org/web/20210824213036/https://handbook.fide.com/files/handbook/C02Standards.pdf
 */
export const FideIndividualRoundRobin = [
  Tiebreaker.DIRECT_ENCOUNTER,
  Tiebreaker.ROUNDS_WON,
  Tiebreaker.SONNEBORN_BERGER,
  Tiebreaker.KOYA
] as const;
