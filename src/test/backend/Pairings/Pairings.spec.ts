/*
 * Copyright (c) 2021  Grzegorz Kita
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

import { readFile } from 'fs/promises';
import path from 'path';

import { readPairs } from '../../../backend/Pairings/Pairings';
import parseTrfFile from '../../../backend/TrfxParser/parseTrfFile';

test('Test reading from TrfPlayer array', async () => {
  const dirPath = path.join(__dirname, '../testTrfFile.txt');

  const data = await readFile(dirPath, 'utf8');
  const tournament = parseTrfFile(data);

  if ('parsingErrors' in tournament) {
    console.error(tournament.parsingErrors);
    throw new Error('Unable to parse TRF file');
  }

  const pairs = readPairs({
    players: tournament.trfxData.players,
    fromRound: 2
  });

  console.debug(pairs);
});
