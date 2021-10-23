/* <pre>
TRF(x) format, based on TRF16, is used

Tournament section:
012 - Tournament Name
022 - City
032 - Federation
042 - Date of start
052 - Date of end
062 - Number of players
072 - Number of rated players
082 - Number of teams in case of a team tournament
092 - Type of tournament
102 - Chief Arbiter
112 - Deputy Chief Arbiter (one line for each arbiter)
122 - Allotted times per moves/game
132 - Dates of the round
 */
interface TrfxFileFormat {
  tournamentName: string;
  city: string;
  federation: string;
  dateOfStart: string;
  dateOfEnd: string;
  numberOfPlayers: number;
  numberOfRatedPlayers: number;
  numberOfTeams: number;
  tournamentType: string;
  chiefArbiter: string;
  deputyArbiters: string[];
  rateOfPlay: string;
  roundDates: string[];
  players: Map<number, TrfPlayer>;
  teams: Map<number, TrfTeam>;
  xxFields: XxFields;
  otherFields: Record<string, string>;
}

export interface XxFields {
  // Acceleration value used for pairings.
  XXA: number;
  // Forbidden pairs for a round.
  XXP: Array<number[]>;
  // Number of rounds to be played. Value is required for pairings.
  XXR: number;
  // Configuration of sorting by rank and starting color.
  XXC: { byRank: boolean, color: Color };

  // Amount of points for win, forfeit win and full-point bye.
  //
  // Will be used for pairing-allocated bye too, if not specified with BBU.
  BBW: number;
  // Amount of points for draw and half-point bye.
  BBD: number;
  // Amount of points for loss.
  BBL: number;
  // Amount of points for zero-point bye.
  BBZ: number;
  // Amount of points for forfeit loss.
  BBF: number;
  // Amount of points for pairing-allocated bye.
  BBU: number;
  // XXZ is not saved - these are injected into player's rounds
  // XXS is not saved either - will be translated into BbpPairings'
  //   values when applicable
}

export type XXField =
  | 'XXA'
  | 'XXP'
  | 'XXR'
  | 'XXC'
  | 'XXZ'
  | 'XXS'

  | 'BBW'
  | 'BBD'
  | 'BBL'
  | 'BBZ'
  | 'BBF'
  | 'BBU'

export type XXScoringField =
  | 'WW' // Points for win with White
  | 'BW' // Points for win with Black
  | 'WD' // Points for draw with White
  | 'BD' // Points for draw with Black
  | 'WL' // Points for loss with White
  | 'BL' // Points for loss with Black
  | 'ZPB' // Points for zero-point-bye
  | 'HPB' // Points for half-point-bye
  | 'FPB' // Points for full-point-bye
  | 'PAB' // Points for pairing-allocated-bye
  | 'FW' // Points for forfeit win
  | 'FL' // Points for forfeit loss
  | 'W' // Encompasses all the codes WW, BW, FW, FPB
  | 'D' // Encompasses all the codes WD, BD, HPB

export default TrfxFileFormat;

export const enum TypeCodes {
  TOURNAMENT_NAME = '012',
  CITY = '022',
  FEDERATION = '032',
  START_DATE = '042',
  END_DATE = '052',
  NUM_PLAYERS = '062',
  NUM_RATED_PLAYERS = '072',
  NUM_TEAMS = '082',
  TYPE = '092',
  CHIEF_ARBITER = '102',
  DEPUTY_ARBITER = '112',
  RATE_OF_PLAY = '122',
  ROUND_DATES = '132',
  PLAYER_ENTRY = '001',
  TEAM_ENTRY = '013'
}

export type RoundId = number;

/* <pre>
Line format:
001 [no] M GM [Player name  33 characters long] 1800 POL [FIDE  num] YYYY/MM/DD 10.0 RANK
  [No] W R  [No] W R  ...
 */
export interface TrfPlayer {
  startingRank: number;
  name: string;
  sex: Sex;
  title: string;
  rating: number;
  federation: string;
  id: number;
  birthDate: string;
  points: number;
  rank: number;
  games: Map<RoundId, TrfGame>;
}

/* <pre>
Line format:
013 [Team name  32 characters long ] [no] [no] [no] ...
 */
export interface TrfTeam {
  name: string;
  playerStartingRanks: TrfPlayer[];
}

export interface TrfGame {
  opponent: number;
  color: Color;
  result: GameResult;
  round: number;
}

export const enum Sex {
  MALE = 'm',
  FEMALE = 'f',
  UNSPECIFIED = ' '
}

export function parseSex(char: string): Sex {
  if (char === 'm') {
    return Sex.MALE;
  }
  if (char === 'w' || char === 'f') {
    return Sex.FEMALE;
  }
  return Sex.UNSPECIFIED;
}

export const enum Color {
  WHITE = 'w',
  BLACK = 'b',

  NONE = '-'
}

const colors = ['w', 'b', '-'];

export function isValidColor(color: string): color is Color {
  return colors.includes(color);
}

export const enum GameResult {
  FORFEIT_LOSS = '-',
  FORFEIT_WIN = '+',

  UNRATED_WIN = 'W',
  UNRATED_DRAW = 'D',
  UNRATED_LOSS = 'L',

  WIN = '1',
  DRAW = '=',
  LOSS = '0',

  HALF_POINT_BYE = 'H',
  FULL_POINT_BYE = 'F', // Theoretically deprecated
  PAIRING_ALLOCATED_BYE = 'U',

  ZERO_POINT_BYE = 'Z'
}

const gameResults = [
  '+', '-',
  'W', 'D', 'L',
  '1', '=', '0',
  'H', 'F', 'U', 'Z'
];

export function isValidResult(result: string): result is GameResult {
  return gameResults.includes(result);
}
