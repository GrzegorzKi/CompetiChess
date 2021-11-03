import Tiebreaker from '../types/Tiebreaker';

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
  // Tiebreaker.SOLKOFF,
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
  Tiebreaker.HEAD_TO_HEAD,
] as const;

/*
  Tiebreak rules used by FIDE Swiss tournaments. Described by paragraph:
  13.16.4. Individual Swiss Tournaments where not all the ratings are consistent.
  <br/>
  Last checked: November 2021
  <br/>
  @link https://web.archive.org/web/20210824213036/https://handbook.fide.com/files/handbook/C02Standards.pdf
 */
export const FideIndividualSwissRatingsNotConsistent = [
  Tiebreaker.BUCHHOLZ_CUT_1,
  Tiebreaker.BUCHHOLZ,
  Tiebreaker.SONNEBORN_BERGER,
  Tiebreaker.PROGRESSIVE,
  // TODO Should be DIRECT_ENCOUNTER. Yet, it is not as easy to implement.
  Tiebreaker.HEAD_TO_HEAD,
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
export const FideIndividualSwissRatingsConsistent = [
  Tiebreaker.BUCHHOLZ_CUT_1,
  Tiebreaker.BUCHHOLZ,
  // TODO Should be DIRECT_ENCOUNTER. Yet, it is not as easy to implement.
  Tiebreaker.HEAD_TO_HEAD,
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
  Tiebreaker.HEAD_TO_HEAD,
  Tiebreaker.ROUNDS_WON,
  Tiebreaker.SONNEBORN_BERGER,
  // Tiebreaker.KOYA
] as const;
