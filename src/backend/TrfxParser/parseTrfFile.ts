import ParseResult, { getDetails, isError, ParseError } from '../types/ParseResult';
import TrfFileFormat, {
  Color,
  Configuration,
  TypeCodes,
  XXField,
} from '../types/TrfFileFormat';

import parseAcceleration from './parseAcceleration';
import parseForbiddenPairs from './parseForbiddenPairs';
import parseTrfPlayer from './parseTrfPlayer';
import { parseNumber } from './ParseUtils';
import {
  calculatePlayedRounds,
  evenUpMatchHistories,
  inferInitialColor,
  removeDummyPlayers,
} from './TrfUtils';

export const enum WarnCode {
  ROUND_NUM,
  INITIAL_COLOR,
  HOLES_IN_IDS,
  HOLES_IN_RANKS
}

export type ParseTrfFileResult =
  | { trfxData: TrfFileFormat, warnings: WarnCode[] }
  | { parsingErrors: string[] };

function createDefaultConfiguration(): Configuration {
  return {
    expectedRounds: 0,
    matchByRank: false,
    initialColor: Color.NONE,
    pointsForWin: 1.0,
    pointsForDraw: 0.5,
    pointsForLoss: 0.0,
    pointsForPairingAllocatedBye: 1.0,
    pointsForZeroPointBye: 0.0,
    pointsForForfeitLoss: 0.0,
  };
}

function createDefaultTrfData(): TrfFileFormat {
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
    players: [],
    playersByPosition: [],
    teams: [],
    configuration: createDefaultConfiguration(),
    otherFields: {},
    forbiddenPairs: [],
    playedRounds: 0,
  };
}

export default function parseTrfFile(content: string): ParseTrfFileResult {
  const trfxData = createDefaultTrfData();
  const forbiddenPairs: Array<number[]> = [];
  const warnings: WarnCode[] = [];

  const parsingErrors: string[] = [];

  function parseXXFields(line: string): ParseResult<undefined> {
    const prefix = line.substring(0, 3);
    const value = line.substring(4);

    if (prefix === XXField.ACCELERATION) {
      const result = parseAcceleration(line, trfxData);
      if (isError(result)) {
        return result;
      }
    } else if (prefix === XXField.FORBIDDEN_PAIRS) {
      const result = parseForbiddenPairs(line);
      if (isError(result)) {
        return result;
      }
      if (result.length !== 0) {
        forbiddenPairs.push(result);
      }
    } else if (prefix === XXField.NUM_ROUNDS) {
      const numRounds = parseNumber(value);
      if (isError(numRounds)) {
        return numRounds;
      }
      trfxData.configuration.expectedRounds = numRounds;
    }
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
      const numPlayers = parseNumber(value);
      if (isError(numPlayers)) {
        errorCallback(numPlayers);
      } else {
        trfxData.numberOfPlayers = numPlayers;
      }
    } else if (prefix === TypeCodes.NUM_RATED_PLAYERS) {
      const numRatedPlayers = parseNumber(value);
      if (isError(numRatedPlayers)) {
        errorCallback(numRatedPlayers);
      } else {
        trfxData.numberOfRatedPlayers = numRatedPlayers;
      }
    } else if (prefix === TypeCodes.NUM_TEAMS) {
      const numTeams = parseNumber(value);
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
      const trfPlayer = parseTrfPlayer(line, trfxData.players);
      if (isError(trfPlayer)) {
        errorCallback(trfPlayer);
      } else {
        trfxData.players[trfPlayer.startingRank] = trfPlayer;
        trfxData.playersByPosition.push(trfPlayer);
      }
    } else if (prefix === TypeCodes.TEAM_ENTRY) {
      // TODO Implement
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
  };

  const postProcessData = () => {
    removeDummyPlayers(trfxData.players);
    const playedRounds = calculatePlayedRounds(trfxData.players);
    trfxData.playedRounds = playedRounds;
    if (trfxData.configuration.expectedRounds <= 0) {
      trfxData.configuration.expectedRounds = playedRounds;
      warnings.push(WarnCode.ROUND_NUM);
    }

    trfxData.forbiddenPairs.push({
      round: playedRounds + 1,
      pairs: forbiddenPairs
    });

    evenUpMatchHistories(trfxData.players, playedRounds);
    if (trfxData.configuration.initialColor === Color.NONE) {
      trfxData.configuration.initialColor = inferInitialColor(trfxData);
    }
    // TODO Needs points and pairings checking

    // TODO At last, check ranks and normalize if necessary
  };

  parseFile();
  postProcessData();

  if (parsingErrors.length !== 0) {
    return { parsingErrors };
  }
  return { trfxData, warnings };
}
