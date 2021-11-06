import { readFile } from 'fs/promises';
import path from 'path';

import BbpPairingsWrapper from '../../../backend/BbpPairings/bbpPairingsWrapper';
import exportComparison from '../../../backend/DataExport/exportComparison';
import exportToTrf from '../../../backend/DataExport/exportToTrf';
import parseTrfFile from '../../../backend/TrfxParser/parseTrfFile';

test('Parse sample file', (done) => {
  // const dirPath = path.join(__dirname, '/testTrfFile.txt');
  const dirPath = path.join(__dirname, '/testLargeFile.trf');
  const forRound = 20;

  readFile(dirPath, 'utf8')
    .then((data) => {
      const tournament = parseTrfFile(data);
      if (!('parsingErrors' in tournament)) {
        const trfOutput = exportToTrf(
          tournament.trfxData,
          { exportForPairing: true, forRound }
        );
        const comparison = exportComparison(tournament.trfxData, forRound);
        console.info(trfOutput);
        console.info(comparison);
        if (trfOutput !== undefined) {
          return trfOutput;
        }
      }
      return Promise.reject(new Error('Unable to parse or export to TRF file'));
    })
    .then((trfOutput) => {
      BbpPairingsWrapper.init()
        .then((wrapper) => {
          const bbpResult = wrapper.invoke(trfOutput);
          console.info(bbpResult);
          if (bbpResult.statusCode !== 0) {
            done(new Error(bbpResult.errorOutput.join('\n')));
          } else {
            done();
          }
        })
        .catch((reason) => {
          done(reason);
        });
    })
    .catch((reason) => {
      done(reason);
    });
});
