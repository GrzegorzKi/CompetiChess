/*
 * Copyright (c) 2021  Grzegorz Kita
 *
 * This file is part of CompetiChess.
 *
 * CompetiChess is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * CompetiChess is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CompetiChess.  If not, see <http://www.gnu.org/licenses/>.
 */

import ParseResult, { ErrorCode, isError } from '../types/ParseResult';
import {
  Color, GameResult, TrfGame, TrfPlayer
} from '../types/TrfFileFormat';
import { parseNumber, tokenizeToNumbers } from '../utils/ParseUtils';
import { sortByRank, sortByScore } from '../utils/SortUtils';
import {
  byeResults,
  calculatePlayedRounds,
  isAbsentFromRound,
  isResultABye,
} from '../utils/TrfUtils';

export type Pair = {
  round: number,
  pair: number,
  white: TrfPlayer,
  black: TrfPlayer,
}

export type UnpairedStatus = typeof byeResults[number] | GameResult.UNASSIGNED;
export type UnpairedMap = Map<TrfPlayer, UnpairedStatus>;

function removeItem<T>(arr: Array<T>, value: T): Array<T> {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function internalReadPairsFromArray(players: TrfPlayer[], pairsRaw: string[], round: number): {
  pairs: Pair[],
  unpaired: UnpairedMap,
} {
  const pairs: Pair[] = [];
  const unpaired: UnpairedMap = new Map();

  const parseResult = parseNumber(pairsRaw[0]);
  if (isError(parseResult)) {
    return { pairs, unpaired };
  }

  for (let i = 1; i < pairsRaw.length; ++i) {
    const indices = tokenizeToNumbers(pairsRaw[i]);
    if (isError(indices) || indices.length !== 2) {
      return { pairs: [], unpaired: new Map() };
    }

    const white = players[indices[0] - 1];

    if (indices[1] === 0) {
      unpaired.set(white, GameResult.PAIRING_ALLOCATED_BYE);
    } else {
      const black = players[indices[1] - 1];

      pairs.push({
        round,
        pair: i,
        white,
        black
      });
    }
  }

  return { pairs, unpaired };
}

function internalReadPairsFromGames(players: TrfPlayer[], round: number): {
  pairs: Pair[],
  unpaired: UnpairedMap,
} {
  const pairs: Pair[] = [];
  const unpaired: UnpairedMap = new Map();
  const usedIds: boolean[] = [];
  let pairNo = 0;

  for (let i = 0; i < players.length; ++i) {
    if (players[i] !== undefined
      && players[i].games[round - 1] !== undefined
      && usedIds[players[i].playerId] === undefined) {
      const { color, opponent: opId, result } = players[i].games[round - 1];
      const opponent = (opId !== undefined) ? players[opId] : undefined;

      if (opponent === undefined) {
        usedIds[players[i].playerId] = true;
        if (isResultABye(result)) {
          unpaired.set(players[i], result);
        } else {
          // Fallback - should never happen
          unpaired.set(players[i], GameResult.UNASSIGNED);
        }
      } else {
        usedIds[players[i].playerId] = true;
        usedIds[opponent.playerId] = true;
        pairNo += 1;
        if (color === Color.BLACK) {
          pairs.push({
            round,
            pair: pairNo,
            white: players[i],
            black: opponent
          });
        } else {
          pairs.push({
            round,
            pair: pairNo,
            white: opponent,
            black: players[i]
          });
        }
      }
    }
  }

  return {
    pairs,
    unpaired,
  };
}

type ReadPairsParams =
  | { players: TrfPlayer[], pairsRaw: string[] }
  | { players: TrfPlayer[], fromRound: number }
  | { players: TrfPlayer[], pairs: Pair[], unpaired: UnpairedMap }

export function readPairs(params: ReadPairsParams) {
  let pairs: Pair[];
  let round: number;
  let unpaired: UnpairedMap = new Map();
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

  function addPair(white: TrfPlayer, black: TrfPlayer): boolean {
    if (white !== black && unpaired.has(white) && unpaired.has(black)) {
      unpaired.delete(white);
      unpaired.delete(black);
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
    if (!pairs.includes(pair)) {
      return false;
    }

    removeItem(pairs, pair);
    unpaired.set(pair.white, GameResult.UNASSIGNED);
    if (pair.black !== undefined) {
      unpaired.set(pair.black, GameResult.UNASSIGNED);
    }
    sortPairs();
    return true;
  }

  function changeUnpairedStatus(player: TrfPlayer, status: UnpairedStatus): boolean {
    if (!unpaired.has(player)) {
      return false;
    }

    unpaired.set(player, status);
    return true;
  }

  function calculateNotPairedPlayers() {
    const paired: boolean[] = [];

    // Avoid duplicates
    unpaired.forEach((_, key) => {
      paired[key.playerId] = true;
    });

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
        const type = isAbsentFromRound(players[i], round)
          ? GameResult.ZERO_POINT_BYE
          : GameResult.UNASSIGNED;
        unpaired.set(players[i], type);
      }
    }
  }

  function validateAndAssignPairs(): ParseResult<undefined> {
    const rounds: TrfGame[] = [];

    for (let i = 0; i < pairs.length; ++i) {
      const whiteId = pairs[i].white.playerId;
      const blackId = pairs[i].black.playerId;

      if (rounds[whiteId] !== undefined || rounds[blackId] !== undefined) {
        return { error: ErrorCode.INVALID_PAIR, number: i + 1 };
      }

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

    // Validate pairs and their consistencies
    for (let i = 0; i < players.length; ++i) {
      if (players[i] !== undefined) {
        const { playerId, games } = players[i];
        if (rounds[playerId] !== undefined && games[round - 1] !== undefined) {
          return { error: ErrorCode.PAIRING_ERROR, hasPairing: true, playerId };
        }
        if (rounds[playerId] === undefined && games[round - 1] === undefined) {
          const result = unpaired.get(players[i]);
          if (result !== undefined && result !== GameResult.UNASSIGNED) {
            rounds[playerId] = {
              round,
              opponent: undefined,
              color: Color.NONE,
              result
            };
          } else {
            return { error: ErrorCode.PAIRING_ERROR, hasPairing: false, playerId };
          }
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
    ({ pairs, unpaired } = internalReadPairsFromArray(players, params.pairsRaw, round));
  } else if ('pairs' in params) {
    round = params.pairs[0]?.round ?? (calculatePlayedRounds(players) + 1);
    pairs = [...params.pairs];
    unpaired = new Map(params.unpaired);
  } else {
    round = Math.max(1, params.fromRound);
    ({ pairs, unpaired } = internalReadPairsFromGames(players, round));
    sortPairs();
  }

  calculateNotPairedPlayers();

  return {
    pairs,
    unpaired,
    addPair,
    removePair,
    changeUnpairedStatus,
    sortPairs,
    validateAndAssignPairs
  };
}
