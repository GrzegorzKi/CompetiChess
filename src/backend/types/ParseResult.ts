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
  | TooManyAccelerations
  | InternalError;

export function isError(obj: ParseResult<any>): obj is ParseError {
  return obj !== null && typeof obj === 'object' && 'error' in obj;
}

export const enum ErrorCode {
  INTERNAL_ERROR,
  INVALID_LINE,
  INVALID_VALUE,
  POINTS_MISMATCH,
  PLAYER_DUPLICATE,
  PAIRING_CONTRADICTION,
  TOO_MANY_ACCELERATIONS,
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
  player: number,
}
export type PlayerDuplicate = {
  error: ErrorCode.PLAYER_DUPLICATE,
  player: number,
}
export type PairingContradiction = {
  error: ErrorCode.PAIRING_CONTRADICTION,
  round: number,
  firstPlayer: number,
  secondPlayer: number,
}
export type TooManyAccelerations = {
  error: ErrorCode.TOO_MANY_ACCELERATIONS,
  player: number,
}
export type InternalError = {
  error: ErrorCode.INTERNAL_ERROR,
  what?: string,
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
    return `Number of points for player ${error.player} doesn't match calculated points`;
  case ErrorCode.PLAYER_DUPLICATE:
    return `Player entry duplicated: ${error.player + 1}`;
  case ErrorCode.PAIRING_CONTRADICTION:
    return `Match contradicts the entry for the opponent. Round ${error.round}, players: ${error.firstPlayer + 1}, ${error.secondPlayer + 1}`;
  case ErrorCode.TOO_MANY_ACCELERATIONS:
    return `Player ${error.player} has more acceleration entries than total number of rounds`;
  case ErrorCode.INTERNAL_ERROR:
  default:
    // Should never happen
    return 'Internal error has occurred';
  }
}
