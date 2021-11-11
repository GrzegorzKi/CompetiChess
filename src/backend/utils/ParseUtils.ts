import ParseResult, { ErrorCode, isError } from '../types/ParseResult';

export function parseNumber(value: string): ParseResult<number> {
  if (value === '') {
    return 0;
  }

  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) {
    return { error: ErrorCode.INVALID_VALUE, value };
  }
  return num;
}

export function parsePlayerId(value: string): ParseResult<number> {
  if (value === '') {
    return { error: ErrorCode.INVALID_VALUE, value, what: 'player ID' };
  }

  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num) || num <= 0) {
    return { error: ErrorCode.INVALID_VALUE, value, what: 'player ID' };
  }

  return num - 1;
}

export function parseFloat(value: string): ParseResult<number> {
  if (value === '') {
    return 0;
  }

  const valueDot = value.replace(/,/g, '.');
  const num = Number.parseFloat(valueDot);
  if (Number.isNaN(num)) {
    return { error: ErrorCode.INVALID_VALUE, value };
  }
  return num;
}

export function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}

/**
 * Checks for trailing, non-whitespace characters
 * @param line Checked string
 * @param position Position from which to check for trailing chars
 */
export function hasTrailingChars(line: string, position: number): boolean {
  return line.substring(position, line.length).trimRight() !== '';
}

export function tokenize(value: string): string[] {
  return value.split(/[ \t]/);
}

export function tokenizeToNumbers(value: string): ParseResult<number[]> {
  const tokens = value.split(/[ \t]/);
  const numbers: number[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const id = parseNumber(tokens[i]);
    if (isError(id)) {
      return id;
    }
    numbers.push(id);
  }

  return numbers;
}
