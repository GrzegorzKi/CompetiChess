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

export function tokenize(line: string): string[] {
  return line.substr(4).split(/ \t/);
}

export function tokenizeToNumbers(line: string): ParseResult<number[]> {
  const tokens = line.substr(4).split(/ \t/);
  const playerIds: number[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const id = parseNumber(tokens[i]);
    if (isError(id)) {
      return id;
    }
    playerIds.push(id);
  }

  return playerIds;
}
