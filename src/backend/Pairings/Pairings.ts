/*
 * Copyright (c) 2021-2022  Grzegorz Kita
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

import ParseResult, { ErrorCode, isError } from '#/types/ParseResult';
import { Color, Game, GameResult, Pair, PlayersRecord } from '#/types/Tournament';
import {
  addByeToPlayer,
  byeResults,
  createByeRound,
  getTypeOfBye,
  isAbsentFromRound,
  isResultABye,
  isWithdrawnOrLate,
} from '#/utils/GamesUtils';
import { parseNumber, tokenizeToNumbers } from '#/utils/ParseUtils';
import { sortByRank, sortByScore } from '#/utils/SortUtils';
import { calculatePlayedRounds } from '#/utils/TournamentUtils';

export type UnpairedStatus = typeof byeResults[number] | GameResult.UNASSIGNED;
export type UnpairedMap = Map<number, UnpairedStatus>;

function removeItem<T>(arr: Array<T>, value: T): Array<T> {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function internalReadPairsFromArray(players: PlayersRecord, pairsRaw: string[], round: number): {
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
    if (!pairsRaw[i].trim()) continue;

    const indices = tokenizeToNumbers(pairsRaw[i]);
    if (isError(indices) || indices.length !== 2) {
      return { pairs: [], unpaired: new Map() };
    }

    const white = indices[0];

    if (indices[1] === 0) {
      unpaired.set(white, GameResult.PAIRING_ALLOCATED_BYE);
    } else {
      const black = indices[1];

      pairs.push({
        round,
        no: i,
        white,
        black
      });
    }
  }

  return { pairs, unpaired };
}

function internalReadPairsFromGames(players: PlayersRecord, round: number): Pair[] {
  const pairs: Pair[] = [];
  const usedIds: boolean[] = [];
  let pairNo = 0;

  for (const [, player] of Object.entries(players)) {
    if (player.games[round - 1] !== undefined
      && usedIds[player.id] === undefined) {
      const { color, opponent } = player.games[round - 1];

      if (opponent !== undefined) {
        usedIds[player.id] = true;
        usedIds[opponent] = true;
        pairNo += 1;
        if (color === Color.BLACK) {
          pairs.push({
            round,
            no: pairNo,
            white: player.id,
            black: opponent
          });
        } else {
          pairs.push({
            round,
            no: pairNo,
            white: opponent,
            black: player.id
          });
        }
      }
    }
  }

  return pairs;
}

type ReadPairsParams =
  | { players: PlayersRecord, pairsRaw: string[] }
  | { players: PlayersRecord, fromRound: number }
  | { players: PlayersRecord, pairs: Pair[] }

export function readPairs(params: ReadPairsParams) {
  let pairs: Pair[];
  let round: number;
  let unpaired: UnpairedMap = new Map();
  let readUnpairedFromResults = false;

  const { players } = params;

  function reassignPairIds() {
    let pairNo = 1;
    for (const pair of pairs) {
      pair.no = pairNo;
      pairNo += 1;
    }
  }

  function sortPairs() {
    // Use scores from previous round to sort
    const compareScore = sortByScore(round - 1);

    pairs.sort((a, b) => {
      const whiteA = players[a.white];
      const blackA = players[a.black];
      const whiteB = players[b.white];
      const blackB = players[b.black];

      if (blackA === undefined) return 1;
      if (blackB === undefined) return -1;

      const higherInPair0 = (compareScore(whiteA, blackA) > 0 || sortByRank(whiteA, blackA) > 0)
        ? blackA
        : whiteA;
      const lowerInPair0 = (whiteA === higherInPair0) ? blackA : whiteA;
      const higherInPair1 = (compareScore(whiteB, blackB) > 0 || sortByRank(whiteB, blackB) > 0)
        ? blackB
        : whiteB;
      const lowerInPair1 = (whiteB === higherInPair0) ? blackB : whiteB;

      if (compareScore(higherInPair0, higherInPair1) > 0
        || compareScore(lowerInPair0, lowerInPair1) > 0
        || sortByRank(higherInPair0, higherInPair1) > 0) {
        return 1;
      }
      return -1;
    });
    reassignPairIds();
  }

  function addPair(white: number, black: number): boolean {
    if (white !== black && unpaired.has(white) && unpaired.has(black)) {
      unpaired.delete(white);
      unpaired.delete(black);
      pairs.push({
        round,
        no: pairs.length,
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

  function changeUnpairedStatus(playerId: number, status: UnpairedStatus): boolean {
    if (!unpaired.has(playerId)) {
      return false;
    }

    unpaired.set(playerId, status);
    return true;
  }

  function calculateNotPairedPlayers() {
    const paired: boolean[] = [];

    // Prevent recalculation for already defined unpaired players
    unpaired.forEach((_, playerId) => {
      paired[playerId] = true;
    });

    for (const pair of pairs) {
      const white = pair.white;
      paired[white] = true;
      const black = pair.black;
      if (black !== undefined) {
        paired[black] = true;
      }
    }

    for (const [, player] of Object.entries(players)) {
      if (paired[player.id] === undefined
          && !isWithdrawnOrLate(player, round)) {
        if (readUnpairedFromResults) {
          const { result } = player.games[round - 1];
          if (isResultABye(result)) {
            unpaired.set(player.id, result);
          } else {
            unpaired.set(player.id, GameResult.UNASSIGNED);
          }
        } else {
          const type = isAbsentFromRound(player, round)
            ? getTypeOfBye(player)
            : GameResult.UNASSIGNED;
          unpaired.set(player.id, type);
        }
      }
    }
  }

  function validateAndGenerateRounds(): ParseResult<Game[]> {
    const rounds: Game[] = [];

    for (const pair of pairs) {
      const whiteId = pair.white;
      const blackId = pair.black;

      if (rounds[whiteId] !== undefined || rounds[blackId] !== undefined) {
        return { error: ErrorCode.INVALID_PAIR, number: pair.no };
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
    for (const [, player] of Object.entries(players)) {
      const { id, games } = player;

      if (rounds[id] !== undefined && games[round - 1] !== undefined) {
        return { error: ErrorCode.PAIRING_ERROR, hasPairing: true, id };
      }

      if (rounds[id] === undefined) {
        if (games[round - 1] === undefined) {
          const result = unpaired.get(player.id);
          if (result !== undefined && result !== GameResult.UNASSIGNED) {
            rounds[id] = {
              round,
              color: Color.NONE,
              result
            };
          } else if (isWithdrawnOrLate(player, round)) {
            rounds[id] = createByeRound(player, round);
          } else {
            return { error: ErrorCode.PAIRING_ERROR, hasPairing: false, id };
          }
        } else {
          rounds[id] = games[round - 1];
        }
      }
    }

    return rounds;
  }

  function apply(targetPairs: Array<Pair[]>): ParseResult<void> {
    const rounds = validateAndGenerateRounds();
    if (isError(rounds)) {
      return rounds;
    }

    // Assign created rounds to players
    // and an entry to notPlayed list for a player
    for (const [, player] of Object.entries(players)) {
      const { id, games } = player;
      games[round - 1] = rounds[id];

      const { result } = games[round - 1];
      if (isResultABye(result) && result !== GameResult.PAIRING_ALLOCATED_BYE) {
        addByeToPlayer(player, round);
      } else {
        removeItem(player.notPlayed, round);
      }
    }

    // Assign pairs to tournament data
    targetPairs[round - 1] = pairs;
  }

  if ('pairsRaw' in params) {
    round = calculatePlayedRounds(players) + 1;
    ({ pairs, unpaired } = internalReadPairsFromArray(players, params.pairsRaw, round));
  } else if ('pairs' in params) {
    round = params.pairs[0]?.round ?? (calculatePlayedRounds(players) + 1);
    pairs = [...params.pairs];
    readUnpairedFromResults = true;
  } else {
    round = Math.max(1, params.fromRound);
    pairs = internalReadPairsFromGames(players, round);
    readUnpairedFromResults = true;
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
    validateAndGenerateRounds,
    apply,
  };
}
