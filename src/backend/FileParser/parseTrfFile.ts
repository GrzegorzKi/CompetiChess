import ParseResult, { getDetails, isError, ParseError } from '../types/ParseResult';
import TrfxFileFormat, {
  Color,
  TrfPlayer,
  TrfTeam,
  TypeCodes,
  XxFields,
} from '../types/TrfxFileFormat';

import parseTrfPlayer from './parseTrfPlayer';
import { tryParseNumber } from './ParseUtils';

export type ParseTrfFileResult =
  | { trfxData: TrfxFileFormat }
  | { parsingErrors: string[] };

function createDefaultXxFields(): XxFields {
  return {
    // Disable acceleration by default
    XXA: 0.0,
    XXP: [],
    // Undefined number of rounds
    XXR: NaN,
    XXC: {
      byRank: false,
      color: Color.NONE,
    },
    BBW: 1.0,
    BBD: 0.5,
    BBL: 0.0,
    BBU: 1.0,
    BBZ: 0.0,
    BBF: 0.0,
  };
}

function createDefaultTrfxData(): TrfxFileFormat {
  return {
    tournamentName: '',
    city: '',
    federation: '',
    dateOfStart: '',
    dateOfEnd: '',
    numberOfPlayers: 0,
    numberOfRatedPlayers: 0,
    numberOfTeams: 0,
    tournamentType: '',
    chiefArbiter: '',
    deputyArbiters: [],
    rateOfPlay: '',
    roundDates: [],
    players: new Map<number, TrfPlayer>(),
    teams: new Map<number, TrfTeam>(),
    xxFields: createDefaultXxFields(),
    otherFields: {},
  };
}

export default function parseTrfFile(content: string): ParseTrfFileResult {
  const trfxData = createDefaultTrfxData();

  const parsingErrors: string[] = [];

  function parseXXFields(line: string): ParseResult<undefined> {
    // TODO: Implement

    return undefined;
  }

  const parseLine = (line: string, lineNum: number) => {
    const errorCallback = (e: ParseError) => {
      parsingErrors.push(`Error on line ${lineNum + 1} - ${getDetails(e)}`);
    };

    if (line.length >= 4 && line.at(3) !== ' ') {
      parsingErrors.push(`Error on line ${lineNum + 1} - Invalid format`);
    }

    const prefix = line.substring(0, 3);
    const value = line.substring(4);
    if (prefix === TypeCodes.TOURNAMENT_NAME) {
      trfxData.tournamentName = value;
    } else if (prefix === TypeCodes.CITY) {
      trfxData.city = value;
    } else if (prefix === TypeCodes.FEDERATION) {
      trfxData.federation = value;
    } else if (prefix === TypeCodes.START_DATE) {
      trfxData.dateOfStart = value;
    } else if (prefix === TypeCodes.END_DATE) {
      trfxData.dateOfEnd = value;
    } else if (prefix === TypeCodes.NUM_PLAYERS) {
      const numPlayers = tryParseNumber(value);
      if (isError(numPlayers)) {
        errorCallback(numPlayers);
      } else {
        trfxData.numberOfPlayers = numPlayers;
      }
    } else if (prefix === TypeCodes.NUM_RATED_PLAYERS) {
      const numRatedPlayers = tryParseNumber(value);
      if (isError(numRatedPlayers)) {
        errorCallback(numRatedPlayers);
      } else {
        trfxData.numberOfRatedPlayers = numRatedPlayers;
      }
    } else if (prefix === TypeCodes.NUM_TEAMS) {
      const numTeams = tryParseNumber(value);
      if (isError(numTeams)) {
        errorCallback(numTeams);
      } else {
        trfxData.numberOfTeams = numTeams;
      }
    } else if (prefix === TypeCodes.TYPE) {
      trfxData.tournamentType = value;
    } else if (prefix === TypeCodes.CHIEF_ARBITER) {
      trfxData.chiefArbiter = value;
    } else if (prefix === TypeCodes.DEPUTY_ARBITER) {
      trfxData.deputyArbiters.push(value);
    } else if (prefix === TypeCodes.RATE_OF_PLAY) {
      trfxData.rateOfPlay = value;
    } else if (prefix === TypeCodes.ROUND_DATES) {
      // Pass - no idea how to parse it with current specification
    } else if (prefix === TypeCodes.PLAYER_ENTRY) {
      const trfPlayer = parseTrfPlayer(line);
      if (isError(trfPlayer)) {
        errorCallback(trfPlayer);
      } else {
        trfxData.players.set(trfPlayer.startingRank, trfPlayer);
      }
    } else {
      const result = parseXXFields(line);
      if (isError(result)) {
        errorCallback(result);
      }
    }
  };

  const parseFile = () => {
    const stringArray = content.split('\n');

    for (let i = 0; i < stringArray.length; ++i) {
      const line = stringArray[i];
      if (line.length >= 3) {
        parseLine(line, i);
      }
    }

    if (parsingErrors.length !== 0) {
      return { parsingErrors };
    }
    return { parsingErrors };
  };

  return parseFile();
}
