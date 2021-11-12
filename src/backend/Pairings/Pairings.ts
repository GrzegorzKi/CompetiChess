import ParseResult, { ErrorCode, isError } from '../types/ParseResult';
import {
  Color, GameResult, TrfGame, TrfPlayer
} from '../types/TrfFileFormat';
import { parseNumber, tokenizeToNumbers } from '../utils/ParseUtils';
import { sortByRank, sortByScore } from '../utils/SortUtils';
import { calculatePlayedRounds, createByeRound, isAbsentFromRound } from '../utils/TrfUtils';

export type Pair = {
  round: number,
  pair: number,
  white: TrfPlayer,
  black?: TrfPlayer,
}

function removeItem<T>(arr: Array<T>, value: T): Array<T> {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function internalReadPairsFromArray(players: TrfPlayer[],
  pairsRaw: string[],
  round: number): Pair[] {
  const parseResult = parseNumber(pairsRaw[0]);
  if (isError(parseResult)) {
    return [];
  }

  const pairs: Pair[] = [];
  for (let i = 1; i < pairsRaw.length; ++i) {
    const indices = tokenizeToNumbers(pairsRaw[i]);
    if (isError(indices) || indices.length !== 2) {
      return [];
    }
    // Unchecked read from array
    const white = players[indices[0] - 1];
    const black = (indices[1] === 0) ? undefined : players[indices[1] - 1];

    pairs.push({
      round,
      pair: i,
      white,
      black
    });
  }

  return pairs;
}

function internalReadPairsFromGames(players: TrfPlayer[], round: number): Pair[] {
  const pairs: Pair[] = [];
  const usedIds: boolean[] = [];
  let pairNo = 1;

  for (let i = 0; i < players.length; ++i) {
    if (players[i] !== undefined
      && players[i].games[round - 1] !== undefined
      && usedIds[players[i].playerId] === undefined) {
      const { color, opponent: opId, result } = players[i].games[round - 1];
      const opponent = (opId !== undefined) ? players[opId] : undefined;

      if (color === Color.WHITE && opponent !== undefined) {
        usedIds[players[i].playerId] = true;
        usedIds[opponent.playerId] = true;
        pairs.push({
          round,
          pair: pairNo,
          white: players[i],
          black: opponent
        });
        pairNo += 1;
      } else if (color === Color.BLACK && opponent !== undefined) {
        usedIds[players[i].playerId] = true;
        usedIds[opponent.playerId] = true;
        pairs.push({
          round,
          pair: pairNo,
          white: opponent,
          black: players[i]
        });
        pairNo += 1;
      } else if (result === GameResult.PAIRING_ALLOCATED_BYE) {
        usedIds[players[i].playerId] = true;
        pairs.push({
          round,
          pair: pairNo,
          white: players[i],
          black: undefined
        });
        pairNo += 1;
      }
    }
  }

  return pairs;
}

type ReadPairsParams =
  | { players: TrfPlayer[], pairsRaw: string[] }
  | { players: TrfPlayer[], fromRound: number }
  | { players: TrfPlayer[], pairs: Pair[] }

export function readPairs(params: ReadPairsParams) {
  let pairs: Pair[];
  let round: number;
  let unpaired: TrfPlayer[];
  const { players } = params;

  function reassignPairIds() {
    let pairNo = 1;
    for (let i = 0; i < pairs.length; ++i) {
      pairs[i].pair = pairNo;
      pairNo += 1;
    }
  }

  function sortPairs() {
    // Use scores from previous round to sort
    const compareScore = sortByScore(round - 1);

    pairs.sort((a, b) => {
      if (a.black === undefined) return 1;
      if (b.black === undefined) return -1;

      const higherInPair0 = (compareScore(a.white, a.black) > 0 || sortByRank(a.white, a.black) > 0)
        ? a.black
        : a.white;
      const lowerInPair0 = (a.white === higherInPair0) ? a.black : a.white;
      const higherInPair1 = (compareScore(b.white, b.black) > 0 || sortByRank(b.white, b.black) > 0)
        ? b.black
        : b.white;
      const lowerInPair1 = (b.white === higherInPair0) ? b.black : b.white;

      if (compareScore(higherInPair0, higherInPair1) > 0
        || compareScore(lowerInPair0, lowerInPair1) > 0
        || sortByRank(higherInPair0, higherInPair1) > 0) {
        return 1;
      }
      return -1;
    });
    reassignPairIds();
  }

  function addPair(white: TrfPlayer, black?: TrfPlayer): boolean {
    if (white !== black && unpaired.includes(white)
      && (black === undefined || unpaired.includes(black))) {
      removeItem(unpaired, white);
      removeItem(unpaired, black);
      pairs.push({
        round,
        pair: pairs.length,
        white,
        black
      });
      sortPairs();
      return true;
    }

    return false;
  }

  function removePair(pair: Pair): boolean {
    if (pairs.includes(pair)) {
      removeItem(pairs, pair);
      unpaired.push(pair.white);
      if (pair.black !== undefined) {
        unpaired.push(pair.black);
      }
      sortPairs();
      return true;
    }

    return false;
  }

  function getNotPairedPlayers(): TrfPlayer[] {
    const paired: boolean[] = [];
    const notPaired: TrfPlayer[] = [];

    for (let i = 0; i < pairs.length; ++i) {
      const white = pairs[i].white.playerId;
      paired[white] = true;
      const black = pairs[i].black?.playerId;
      if (black !== undefined) {
        paired[black] = true;
      }
    }

    for (let i = 0; i < players.length; ++i) {
      if (players[i] !== undefined && paired[players[i].playerId] === undefined) {
        notPaired.push(players[i]);
      }
    }

    return notPaired;
  }

  function validateAndAssignPairs(): ParseResult<undefined> {
    const rounds: TrfGame[] = [];

    for (let i = 0; i < pairs.length; ++i) {
      const whiteId = pairs[i].white.playerId;
      const blackId = pairs[i].black?.playerId;

      if (rounds[whiteId] !== undefined
        || (blackId !== undefined && rounds[blackId] !== undefined)) {
        return { error: ErrorCode.INVALID_PAIR, number: i + 1 };
      }

      if (blackId === undefined) {
        rounds[whiteId] = {
          round,
          color: Color.NONE,
          result: GameResult.PAIRING_ALLOCATED_BYE
        };
      } else {
        rounds[whiteId] = {
          round,
          opponent: blackId,
          color: Color.WHITE,
          result: GameResult.UNASSIGNED
        };
        rounds[blackId] = {
          round,
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
        if (rounds[playerId] !== undefined && games[round - 1] !== undefined) {
          return { error: ErrorCode.PAIRING_ERROR, hasPairing: true, playerId };
        }
        if (rounds[playerId] === undefined && games[round - 1] === undefined) {
          if (!isAbsentFromRound(players[i], round)) {
            return { error: ErrorCode.PAIRING_ERROR, hasPairing: false, playerId };
          }
          rounds[playerId] = createByeRound(players[i], round);
        }
      }
    }

    // Assign created rounds to players
    for (let i = 0; i < players.length; ++i) {
      if (players[i] !== undefined) {
        const { playerId, games } = players[i];
        games[round - 1] = rounds[playerId];
      }
    }

    return undefined;
  }

  if ('pairsRaw' in params) {
    round = calculatePlayedRounds(players) + 1;
    pairs = internalReadPairsFromArray(players, params.pairsRaw, round);
  } else if ('pairs' in params) {
    round = params.pairs[0]?.round ?? (calculatePlayedRounds(players) + 1);
    pairs = [...params.pairs];
  } else {
    round = Math.max(1, params.fromRound);
    pairs = internalReadPairsFromGames(players, round);
    sortPairs();
  }

  unpaired = getNotPairedPlayers();

  return {
    pairs,
    unpaired,
    addPair,
    removePair,
    sortPairs,
    validateAndAssignPairs
  };
}
