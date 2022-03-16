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

import { parseResultString, toResultString } from '#/utils/ResultUtils';
import { createDefaultConfiguration } from '#/utils/TournamentUtils';

describe('parseResultString', () => {
  const configuration = createDefaultConfiguration();

  it.each([
    ['1:0', '1:0'],
    ['0:1', '0:1'],
    ['0:0', '0:0'],
    ['+:-', '+:-'],
    ['-:+', '-:+'],
    ['-:-', '-:-'],
    ['+:0', '+:-'],
    ['-:1', '-:+'],
    ['-:0', '-:+'],
    ['0:x', '0:0'],
    ['1:x', '1:0'],
    ['x:0', ''],
    ['x:1', ''],
    ['W:0', ''],
    ['D:0', ''],
    ['L:0', ''],
    ['0:W', '0:0'],
    ['0:D', '0:0'],
    ['0:L', '0:0'],
    // Invalid as per default configuration
    ['1:1', ''],
    ['1:=', ''],
    ['=:1', ''],
    // Test half points
    ['=:0', '=:0'],
    ['.5:0', '=:0'],
    ['0.5:0', '=:0'],
    ['0:=', '0:='],
    ['0:.5', '0:='],
    ['0:0.5', '0:='],
    ['=:0.5', '=:='],
    ['=:.5', '=:='],
    ['0.5:=', '=:='],
    ['.5:=', '=:='],
    ['=:=', '=:='],
    // Potentially invalid, doing lenient parsing
    ['=:-', '=:0'],
    ['=:+', ''],
    ['=:', '=:0'],
    ['0.5:', '=:0'],
    ['+:', '+:-'],
    ['+', '+:-'],
    ['-', '-:+'],
    ['=', '=:0'],
    ['1', '1:0'],
    ['0', '0:0'],
    ['', ''],
    ['1:0=', ''],
    ['1=:0=', ''],
    ['0=:0=', '=:='],
    ['0=:0=', '=:='],
    ['==:=0', '=:='],
    ['1:0:1', '1:0'],
    ['1:0:abc', '1:0'],
    ['1:0.abc', '1:0'],
    ['=:0.5.abc', '=:='],
  ])('Should parse from "%s" to "%s"', (value, expected) => {
    const result = parseResultString(value, configuration);

    expect(toResultString(result)).toBe(expected);
  });
});
