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
import { Sex } from '#/types/Tournament';

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

export function parseFloatNumber(value: string): ParseResult<number> {
  if (value === '') {
    return 0;
  }

  const num = Number.parseFloat(value);
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

  return num;
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

export function parseSex(char: string): Sex {
  if (char === 'm') {
    return Sex.MALE;
  }
  if (char === 'w' || char === 'f') {
    return Sex.FEMALE;
  }
  return Sex.UNSPECIFIED;
}

export function isBetween(num: number, min: number, max: number): boolean {
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

export function tokenize(value: string, splitter: RegExp | string = /[ \t]/): string[] {
  return value.split(splitter);
}

export function tokenizeToNumbers(value: string, splitter: RegExp | string = /[ \t]/): ParseResult<number[]> {
  const tokens = value.split(splitter);
  const numbers: number[] = [];
  for (const token of tokens) {
    const id = parseNumber(token);
    if (isError(id)) {
      return id;
    }
    numbers.push(id);
  }

  return numbers;
}
