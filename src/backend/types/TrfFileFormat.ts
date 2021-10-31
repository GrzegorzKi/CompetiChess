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
interface TrfFileFormat {
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
  players: TrfPlayer[];
  playersByPosition: TrfPlayer[];
  teams: TrfTeam[];
  configuration: Configuration;
  otherFields: Record<string, string>;
  playedRounds: number;
  forbiddenPairs: ForbiddenPairs[];
}

export default TrfFileFormat;

export interface ForbiddenPairs {
  round: number;
  pairs: Array<Array<number>>;
}

export interface Configuration {
  // Number of rounds to be played. Value is required for pairings.
  expectedRounds: number;
  // Should program use positional-ids (also called ranking-id(s)) in order to
  // produce the pairings. Especially useful, if we decide to sort players
  // later and want it to affect consequent pairings.
  matchByRank: boolean;
  // Initial color to pick for first round.
  //
  // When set to NONE, program can offer to pick based on hash of tournament data.
  initialColor: Color;

  // Amount of points for win, forfeit win and full-point bye.
  //
  // Will be used for pairing-allocated bye too, if not specified with BBU code.
  pointsForWin: number;
  // Amount of points for draw and half-point bye.
  pointsForDraw: number;
  // Amount of points for loss.
  pointsForLoss: number;
  // Amount of points for zero-point bye.
  pointsForZeroPointBye: number;
  // Amount of points for forfeit loss.
  pointsForForfeitLoss: number;
  // Amount of points for pairing-allocated bye.
  pointsForPairingAllocatedBye: number;
}

export const enum XXField {
  ACCELERATION = 'XXA',
  FORBIDDEN_PAIRS = 'XXP',
  NUM_ROUNDS = 'XXR',
  CONFIG = 'XXC',
  BYES = 'XXZ',
  POINTS_MODIFIER = 'XXS',

  P_FOR_WIN = 'BBW',
  P_FOR_DRAW = 'BBD',
  P_FOR_LOSS = 'BBL',
  P_FOR_ZP_BYE = 'BBZ',
  P_FOR_FORFEIT = 'BBF',
  P_FOR_PA_BYE = 'BBU',
}

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
  playerId: number;
  name: string;
  sex: Sex;
  title: string;
  rating: number;
  federation: string;
  id: number;
  birthDate: string;
  points: number;
  rank: number;
  games: TrfGame[];

  accelerations: number[],
}

/* <pre>
Line format:
013 [Team name  32 characters long ] [no] [no] [no] ...
 */
export interface TrfTeam {
  name: string;
  playerStartingRanks: number[];
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

export const enum Color {
  WHITE = 'w',
  BLACK = 'b',

  NONE = '-'
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
