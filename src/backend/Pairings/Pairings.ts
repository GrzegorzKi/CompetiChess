import ParseResult, { ErrorCode, isError } from '../types/ParseResult';
import {
  Color,
  GameResult,
  TrfGame,
  TrfPlayer
} from '../types/TrfFileFormat';
import { parseNumber, tokenizeToNumbers } from '../utils/ParseUtils';
import { createByeRound, calculatePlayedRounds, isAbsentFromRound } from '../utils/TrfUtils';

export type Pair = {
  round: number,
  pair: number,
  whitePlayer: TrfPlayer,
  blackPlayer?: TrfPlayer,
}

export function readPairsFromArray(players: TrfPlayer[], pairsRaw: string[]): Pair[] {
  const parseResult = parseNumber(pairsRaw[0]);
  if (isError(parseResult)) {
    return [];
  }

  const currentRound = calculatePlayedRounds(players);

  const pairs: Pair[] = [];
  for (let i = 1; i < pairsRaw.length; ++i) {
    const indices = tokenizeToNumbers(pairsRaw[i]);
    if (isError(indices) || indices.length !== 2) {
      return [];
    }
    const whitePlayer = players[indices[0] - 1];
    const blackPlayer = (indices[1] === 0) ? undefined : players[indices[1] - 1];

    pairs.push({
      round: currentRound,
      pair: i,
      whitePlayer,
      blackPlayer
    });
  }

  return pairs;
}

export function validateAndAssignPairs(players: TrfPlayer[],
  pairs: Pair[]): ParseResult<undefined> {
  const rounds: TrfGame[] = [];
  const currentRound = calculatePlayedRounds(players);

  for (let i = 0; i < pairs.length; ++i) {
    const whiteId = pairs[i].whitePlayer.playerId;
    const blackId = pairs[i].blackPlayer?.playerId;

    if (rounds[whiteId] !== undefined || (blackId !== undefined && rounds[blackId] !== undefined)) {
      return { error: ErrorCode.INVALID_PAIR, number: i + 1 };
    }

    if (blackId === undefined) {
      rounds[whiteId] = {
        round: currentRound + 1,
        color: Color.NONE,
        result: GameResult.PAIRING_ALLOCATED_BYE
      };
    } else {
      rounds[whiteId] = {
        round: currentRound + 1,
        opponent: blackId,
        color: Color.WHITE,
        result: GameResult.UNASSIGNED
      };
      rounds[blackId] = {
        round: currentRound + 1,
        opponent: whiteId,
        color: Color.BLACK,
        result: GameResult.UNASSIGNED
      };
    }
  }

  // Validate pairs and their consistencies
  for (let i = 0; i < players.length; ++i) {
    if (players[i] !== undefined) {
      const { playerId, games } = players[i];
      if (rounds[playerId] !== undefined && games[currentRound] !== undefined) {
        return { error: ErrorCode.PAIRING_ERROR, hasPairing: true, playerId };
      }
      if (rounds[playerId] === undefined && games[currentRound] === undefined) {
        if (!isAbsentFromRound(players[i], currentRound + 1)) {
          return { error: ErrorCode.PAIRING_ERROR, hasPairing: false, playerId };
        }
        rounds[playerId] = createByeRound(players[i], currentRound);
      }
    }
  }

  // Assign created rounds to players
  for (let i = 0; i < players.length; ++i) {
    if (players[i] !== undefined) {
      const { playerId, games } = players[i];
      games[currentRound] = rounds[playerId];
    }
  }

  return undefined;
}
