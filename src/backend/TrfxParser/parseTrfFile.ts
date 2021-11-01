import ParseResult, {
  ErrorCode, getDetails, isError, ParseError
} from '../types/ParseResult';
import TournamentData from '../types/TournamentData';
import { Color, TypeCodes, XXField } from '../types/TrfFileFormat';
import { parseNumber } from '../utils/ParseUtils';
import { calculatePlayedRounds, evenUpMatchHistories } from '../utils/TrfUtils';

import parseAcceleration, { Acceleration } from './parseAcceleration';
import parseForbiddenPairs from './parseForbiddenPairs';
import parseTrfPlayer from './parseTrfPlayer';

export const enum WarnCode {
  ROUND_NUM,
  INITIAL_COLOR,
  HOLES_IN_IDS,
}

export type ParseTrfFileResult =
  | { trfxData: TournamentData, warnings: WarnCode[] }
  | { parsingErrors: string[] };

export default function parseTrfFile(content: string): ParseTrfFileResult {
  const tournamentData = new TournamentData();
  const accelerations: Array<Acceleration> = [];
  const forbiddenPairs: Array<number[]> = [];

  const warnings: WarnCode[] = [];

  const parsingErrors: string[] = [];

  function parseXXFields(line: string): ParseResult<undefined> {
    const prefix = line.substring(0, 3);
    const value = line.substring(4);

    if (prefix === XXField.ACCELERATION) {
      const result = parseAcceleration(line);
      if (isError(result)) {
        return result;
      }
      accelerations.push(result);
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
      tournamentData.expectedRounds = numRounds;
    }
    // TODO: Implement

    return undefined;
  }

  const parseLine = (line: string, lineNum: number) => {
    const errorCallback = (e: ParseError) => {
      parsingErrors.push(`Error on line ${lineNum + 1} - ${getDetails(e)}`);
    };

    if (line.length >= 4 && line.at(3) !== ' ') {
      errorCallback({ error: ErrorCode.INVALID_LINE });
    }

    const prefix = line.substring(0, 3);
    const value = line.substring(4).trimEnd();

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
      const trfPlayer = parseTrfPlayer(line);
      if (isError(trfPlayer)) {
        errorCallback(trfPlayer);
      } else if (tournamentData.players[trfPlayer.playerId] !== undefined) {
        errorCallback({ error: ErrorCode.PLAYER_DUPLICATE, playerId: trfPlayer.playerId });
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
    const stringArray = content.split(/[\r\n]+/);

    for (let i = 0; i < stringArray.length; ++i) {
      const line = stringArray[i];
      if (line.length >= 3) {
        parseLine(line, i);
      }
    }
  };

  const postProcessData = (): ParseTrfFileResult => {
    const resultAcc = tournamentData.checkAndAssignAccelerations(accelerations);
    if (isError(resultAcc)) {
      return {
        parsingErrors: [getDetails(resultAcc)]
      };
    }

    const playedRounds = calculatePlayedRounds(tournamentData.players);
    tournamentData.playedRounds = playedRounds;
    if (tournamentData.expectedRounds <= 0
        || tournamentData.playedRounds > tournamentData.expectedRounds) {
      tournamentData.expectedRounds = playedRounds;
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
    for (let i = 0, len = tournamentData.playersByPosition.length; i < len; ++i) {
      tournamentData.recalculateScores(tournamentData.playersByPosition[i]);
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
