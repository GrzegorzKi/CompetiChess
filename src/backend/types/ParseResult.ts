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

export type ParseResult<T> =
  | T
  | ParseError

export default ParseResult;

export type ParseError =
  | InvalidLine
  | InvalidValue
  | PointsMismatch
  | PlayerDuplicate
  | PairingContradiction
  | AccMissingEntry
  | TooManyAccelerations
  | InvalidPair
  | PairingError
  | InternalError

export const enum ErrorCode {
  INTERNAL_ERROR,
  INVALID_LINE,
  INVALID_VALUE,
  POINTS_MISMATCH,
  PLAYER_DUPLICATE,
  PAIRING_CONTRADICTION,
  ACC_MISSING_ENTRY,
  TOO_MANY_ACCELERATIONS,
  INVALID_PAIR,
  PAIRING_ERROR,
}

export function isError(obj: ParseResult<unknown>): obj is ParseError {
  return typeof obj === 'object' && obj !== null && 'error' in obj;
}

export type InvalidLine = {
  error: ErrorCode.INVALID_LINE,
}
export type InvalidValue = {
  error: ErrorCode.INVALID_VALUE,
  what?: string,
  value: string,
}
export type PointsMismatch = {
  error: ErrorCode.POINTS_MISMATCH,
  id: number,
}
export type PlayerDuplicate = {
  error: ErrorCode.PLAYER_DUPLICATE,
  id: number,
}
export type PairingContradiction = {
  error: ErrorCode.PAIRING_CONTRADICTION,
  round: number,
  firstPlayer: number,
  secondPlayer: number,
}
export type AccMissingEntry = {
  error: ErrorCode.ACC_MISSING_ENTRY,
  id: number,
}
export type TooManyAccelerations = {
  error: ErrorCode.TOO_MANY_ACCELERATIONS,
  id: number,
}
export type InvalidPair = {
  error: ErrorCode.INVALID_PAIR,
  number: number,
}
export type PairingError = {
  error: ErrorCode.PAIRING_ERROR,
  hasPairing: boolean,
  id: number,
}
export type InternalError = {
  error: ErrorCode.INTERNAL_ERROR,
  what?: string,
}

function assertUnreachable(x: never): never {
  throw new Error(`Unexpected error has occurred: ${x}`);
}

export function getDetails(error: ParseError): string {
  switch (error.error) {
  case ErrorCode.INVALID_LINE:
    return 'Invalid or malformed line structure';
  case ErrorCode.INVALID_VALUE:
    if (error.what !== undefined) {
      return `Provided value for ${error.what} is invalid: ${error.value}`;
    }
    return `Provided value is invalid: ${error.value}`;
  case ErrorCode.POINTS_MISMATCH:
    return `Number of points for player ${error.id} doesn't match calculated points`;
  case ErrorCode.PLAYER_DUPLICATE:
    return `Player entry duplicated: ${error.id}`;
  case ErrorCode.PAIRING_CONTRADICTION:
    return `Match contradicts the entry for the opponent. Round ${error.round}, players: ${error.firstPlayer}, ${error.secondPlayer}`;
  case ErrorCode.ACC_MISSING_ENTRY:
    return `Acceleration entry refers to player ${error.id}, but is not present on the list`;
  case ErrorCode.TOO_MANY_ACCELERATIONS:
    return `Player ${error.id} has more acceleration entries than total number of rounds`;
  case ErrorCode.INVALID_PAIR:
    return `Pair ${error.number} has players which were already processed`;
  case ErrorCode.PAIRING_ERROR:
    if (error.hasPairing) {
      return `Player ${error.id} is already paired`;
    }
    return `Player ${error.id} is not paired against any opponent and doesn't have assigned status`;
  case ErrorCode.INTERNAL_ERROR:
    if (error.what !== undefined) {
      return `Internal error has occurred: ${error.what}`;
    }
    return 'Internal error has occurred';
  }

  assertUnreachable(error);
}
