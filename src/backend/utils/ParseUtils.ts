import ParseResult, { ErrorCode } from '../types/ParseResult';

export const parseNumber = (value: string): ParseResult<number> => {
  if (value === '') {
    return 0;
  }

  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) {
    return { error: ErrorCode.INVALID_VALUE, value };
  }
  return num;
};

export const parsePlayerId = (value: string): ParseResult<number> => {
  if (value === '') {
    return { error: ErrorCode.INVALID_VALUE, value, what: 'player ID' };
  }

  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num) || num <= 0) {
    return { error: ErrorCode.INVALID_VALUE, value, what: 'player ID' };
  }

  return num - 1;
};

export const parseFloat = (value: string): ParseResult<number> => {
  if (value === '') {
    return 0;
  }

  const valueDot = value.replace(/,/g, '.');
  const num = Number.parseFloat(valueDot);
  if (Number.isNaN(num)) {
    return { error: ErrorCode.INVALID_VALUE, value };
  }
  return num;
};

export const isInRange = (num: number, min: number, max: number)
  : boolean => num >= min && num <= max;

/**
 * Checks for trailing, non-whitespace characters
 * @param line Checked string
 * @param position Position from which to check for trailing chars
 */
export const hasTrailingChars = (line: string, position: number)
  : boolean => line.substring(position, line.length).trimRight() !== '';
