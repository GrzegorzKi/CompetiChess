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

import 'regenerator-runtime/runtime';

import { readFile } from 'fs/promises';
import path from 'path';

import BbpPairings from '../../../src/backend/BbpPairings/bbpPairings';
import exportComparison from '../../../src/backend/DataExport/exportComparison';
import exportToTrf from '../../../src/backend/DataExport/exportToTrf';
import { readPairs } from '../../../src/backend/Pairings/Pairings';
import parseTrfFile from '../../../src/backend/TrfxParser/parseTrfFile';
import { getDetails, isError } from '../../../src/backend/types/ParseResult';

test('Parse sample file', async () => {
  const dirPath = path.join(__dirname, '../testTrfFile.txt');
  // const dirPath = path.join(__dirname, '../testLargeFile.trf');
  const forRound = 3;

  const data = await readFile(dirPath, 'utf8');
  const tournament = parseTrfFile(data);

  if ('parsingErrors' in tournament) {
    console.error(tournament.parsingErrors);
    throw new Error('Unable to parse TRF file');
  }

  tournament.trfxData.deletePairings(forRound + 1);

  const trfOutput = exportToTrf(
    tournament.trfxData,
    { exportForPairing: true, forRound }
  );
  const comparison = exportComparison(tournament.trfxData, forRound);
  expect(trfOutput).not.toBeNull();
  expect(comparison).not.toBeNull();

  console.info(trfOutput);
  console.info(comparison);

  const wrapper = await BbpPairings.createInstance();
  const bbpResult = wrapper.invoke(trfOutput!);
  console.info(bbpResult);

  if (bbpResult.statusCode !== 0) {
    throw new Error(bbpResult.errorOutput.join('\n'));
  }

  const pairs = readPairs({
    players: tournament.trfxData.players,
    pairsRaw: bbpResult.data
  });
  const result = pairs.apply(tournament.trfxData);
  if (isError(result)) {
    throw new Error(getDetails(result));
  }

  return tournament.trfxData;
});
