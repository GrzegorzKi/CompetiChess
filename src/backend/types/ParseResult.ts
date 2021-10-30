export type ParseResult<T> =
  | T
  | ParseError

export default ParseResult;

export type ParseError = { error: ErrorCode, what?: string }

export function isError(obj: ParseResult<any>): obj is ParseError {
  return obj !== null && typeof obj === 'object' && 'error' in obj;
}

export const enum ErrorCode {
  INTERNAL_ERROR,
  INVALID_LINE,
  INVALID_VALUE,
  UNSUPPORTED_VALUE,
  NOT_A_NUMBER,
  POINTS_MISMATCH,
  COLOR_MISMATCH,
  PLAYER_DUPLICATE,
  PAIRING_CONTRADICTION,
  TOO_MANY_ACCELERATIONS,
}

export function getDetails(error: ParseError): string {
  switch (error.error) {
  case ErrorCode.INVALID_LINE:
    return 'Invalid or malformed line structure';
  case ErrorCode.INVALID_VALUE:
    if (error.what !== undefined) {
      return `Provided value is invalid: ${error.what}`;
    }
    return 'Provided value is invalid';
  case ErrorCode.UNSUPPORTED_VALUE:
    if (error.what !== undefined) {
      return `Provided value is unsupported: ${error.what}`;
    }
    return 'Provided value is unsupported';
  case ErrorCode.POINTS_MISMATCH:
    return 'Number of points and calculated points doesn\'t match';
  case ErrorCode.COLOR_MISMATCH:
    if (error.what !== undefined) {
      return `Player's and opponent's colors must differ: ${error.what}`;
    }
    return 'Player\'s and opponent\'s colors must differ';
  case ErrorCode.NOT_A_NUMBER:
    if (error.what !== undefined) {
      return `Provided value is not a valid number: ${error.what}`;
    }
    return 'Provided value is not a valid number';
  case ErrorCode.PLAYER_DUPLICATE:
    if (error.what !== undefined) {
      return `Player entry duplicated: ${error.what}`;
    }
    return 'Player entry duplicated';
  case ErrorCode.PAIRING_CONTRADICTION:
    if (error.what !== undefined) {
      return `Match contradicts the entry for the opponent: ${error.what}`;
    }
    return 'Match contradicts the entry for the opponent';
  case ErrorCode.TOO_MANY_ACCELERATIONS:
    if (error.what !== undefined) {
      return `Player has more acceleration entries than total number of rounds: ${error.what}`;
    }
    return 'Player has more acceleration entries than total number of rounds';
  case ErrorCode.INTERNAL_ERROR:
  default:
    // Should never happen
    return 'Internal error has occurred';
  }
}
