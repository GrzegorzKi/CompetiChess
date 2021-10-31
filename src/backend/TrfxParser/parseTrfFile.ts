import ParseResult, { getDetails, isError, ParseError } from '../types/ParseResult';
import TournamentData from '../types/TournamentData';
import TrfFileFormat, {
  Color, TypeCodes, XXField
} from '../types/TrfFileFormat';

import parseAcceleration from './parseAcceleration';
import parseForbiddenPairs from './parseForbiddenPairs';
import parseTrfPlayer from './parseTrfPlayer';
import { parseNumber } from './ParseUtils';
import {
  calculatePlayedRounds, evenUpMatchHistories, removeDummyPlayers,
} from './TrfUtils';

export const enum WarnCode {
  ROUND_NUM,
  INITIAL_COLOR,
  HOLES_IN_IDS,
}

export type ParseTrfFileResult =
  | { trfxData: TrfFileFormat, warnings: WarnCode[] }
  | { parsingErrors: string[] };

export default function parseTrfFile(content: string): ParseTrfFileResult {
  const tournamentData = new TournamentData();
  const forbiddenPairs: Array<number[]> = [];
  const warnings: WarnCode[] = [];

  const parsingErrors: string[] = [];

  function parseXXFields(line: string): ParseResult<undefined> {
    const prefix = line.substring(0, 3);
    const value = line.substring(4);

    if (prefix === XXField.ACCELERATION) {
      const result = parseAcceleration(line, tournamentData);
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
      tournamentData.configuration.expectedRounds = numRounds;
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
      tournamentData.tournamentName = value;
    } else if (prefix === TypeCodes.CITY) {
      tournamentData.city = value;
    } else if (prefix === TypeCodes.FEDERATION) {
      tournamentData.federation = value;
    } else if (prefix === TypeCodes.START_DATE) {
      tournamentData.dateOfStart = value;
    } else if (prefix === TypeCodes.END_DATE) {
      tournamentData.dateOfEnd = value;
    } else if (prefix === TypeCodes.NUM_PLAYERS) {
      const numPlayers = parseNumber(value);
      if (isError(numPlayers)) {
        errorCallback(numPlayers);
      } else {
        tournamentData.numberOfPlayers = numPlayers;
      }
    } else if (prefix === TypeCodes.NUM_RATED_PLAYERS) {
      const numRatedPlayers = parseNumber(value);
      if (isError(numRatedPlayers)) {
        errorCallback(numRatedPlayers);
      } else {
        tournamentData.numberOfRatedPlayers = numRatedPlayers;
      }
    } else if (prefix === TypeCodes.NUM_TEAMS) {
      const numTeams = parseNumber(value);
      if (isError(numTeams)) {
        errorCallback(numTeams);
      } else {
        tournamentData.numberOfTeams = numTeams;
      }
    } else if (prefix === TypeCodes.TYPE) {
      tournamentData.tournamentType = value;
    } else if (prefix === TypeCodes.CHIEF_ARBITER) {
      tournamentData.chiefArbiter = value;
    } else if (prefix === TypeCodes.DEPUTY_ARBITER) {
      tournamentData.deputyArbiters.push(value);
    } else if (prefix === TypeCodes.RATE_OF_PLAY) {
      tournamentData.rateOfPlay = value;
    } else if (prefix === TypeCodes.ROUND_DATES) {
      // Pass - no idea how to parse it with current specification
    } else if (prefix === TypeCodes.PLAYER_ENTRY) {
      const trfPlayer = parseTrfPlayer(line, tournamentData.players);
      if (isError(trfPlayer)) {
        errorCallback(trfPlayer);
      } else {
        tournamentData.players[trfPlayer.playerId] = trfPlayer;
        tournamentData.playersByPosition.push(trfPlayer);
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

  const postProcessData = (): ParseTrfFileResult => {
    removeDummyPlayers(tournamentData.players);
    const playedRounds = calculatePlayedRounds(tournamentData.players);
    tournamentData.playedRounds = playedRounds;
    if (tournamentData.configuration.expectedRounds <= 0
        || tournamentData.playedRounds > tournamentData.configuration.expectedRounds) {
      tournamentData.configuration.expectedRounds = playedRounds;
      warnings.push(WarnCode.ROUND_NUM);
    }

    tournamentData.forbiddenPairs.push({
      round: playedRounds + 1,
      pairs: forbiddenPairs
    });

    evenUpMatchHistories(tournamentData.players, playedRounds);
    if (tournamentData.configuration.initialColor === Color.NONE) {
      const color = tournamentData.inferInitialColor();
      if (color === Color.NONE) {
        warnings.push(WarnCode.INITIAL_COLOR);
      } else {
        tournamentData.configuration.initialColor = color;
      }
    }

    const result = tournamentData.validatePairConsistency();
    if (isError(result)) {
      return {
        parsingErrors: [getDetails(result)]
      };
    }
    const result2 = tournamentData.validateScores();
    if (isError(result2)) {
      return {
        parsingErrors: [getDetails(result2)]
      };
    }
    // TODO At last, check ranks and normalize if necessary

    return { trfxData: tournamentData, warnings };
  };

  parseFile();
  if (parsingErrors.length !== 0) {
    return { parsingErrors };
  }

  return postProcessData();
}