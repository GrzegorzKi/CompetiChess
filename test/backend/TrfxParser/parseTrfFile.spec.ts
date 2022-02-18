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

import BbpPairings from '#/BbpPairings/bbpPairings';
import exportComparison from '#/DataExport/exportComparison';
import exportToTrf from '#/DataExport/exportToTrf';
import { readPairs } from '#/Pairings/Pairings';
import parseTrfFile from '#/TrfxParser/parseTrfFile';
import { getDetails, isError } from '#/types/ParseResult';
import { deletePairings, getPlayers } from '#/utils/TournamentUtils';

test('Parse sample file', async () => {
  const dirPath = path.join(__dirname, '../testTrfFile.txt');
  // const dirPath = path.join(__dirname, '../testLargeFile.trf');
  const forRound = 3;

  const parseResult = parseTrfFile(await readFile(dirPath, 'utf8'));

  if ('parsingErrors' in parseResult) {
    console.error(parseResult.parsingErrors);
    throw new Error('Unable to parse TRF file');
  }

  const {
    tournament,
    configuration,
    players,
    playersByPosition,
    pairs
  } = parseResult;

  deletePairings(pairs, players, forRound + 1);

  const trfOutput = exportToTrf({
    tournament,
    players: getPlayers(players, playersByPosition, configuration.matchByRank),
    configuration,
    forRound,
    exportForPairing: true,
  });
  const comparison = exportComparison(players, configuration.tiebreakers, forRound);

  expect(trfOutput).not.toBeNull();
  expect(comparison).not.toBeNull();

  console.info(trfOutput);
  console.info(comparison);

  const wrapper = await BbpPairings.getInstance();
  const bbpResult = wrapper.invoke(trfOutput!);
  console.info(bbpResult);

  if (bbpResult.statusCode !== 0) {
    throw new Error(bbpResult.errorOutput.join('\n'));
  }

  const pairsParser = readPairs({
    players,
    pairsRaw: bbpResult.data
  });
  const result = pairsParser.apply(pairs);
  if (isError(result)) {
    throw new Error(getDetails(result));
  }

  return tournament;
});
