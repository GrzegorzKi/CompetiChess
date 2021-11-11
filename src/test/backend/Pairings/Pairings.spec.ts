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
