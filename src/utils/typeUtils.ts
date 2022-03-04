/*
 * Copyright (c) 2022  Grzegorz Kita
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

export function convertStringRecordToNumberRecord<T>(record: Record<string, T>): Record<number, T> | undefined {
  const newRecord: Record<number, T> = {};
  for (const [key, value] of Object.entries(record)) {
    const numKey = parseInt(key, 10);
    if (isNaN(numKey)) {
      return undefined;
    }
    newRecord[numKey] = value;
  }
  return newRecord;
}

export function convertStringArrayToNumberArray(array: string[]): number[] | undefined {
  const newArray: number[] = [];
  for (const value of array) {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      return undefined;
    }
    newArray.push(numValue);
  }
  return newArray;
}