import { readFile } from 'fs/promises';
import path from 'path';

import BbpPairingsWrapper from '../../../backend/BbpPairings/bbpPairingsWrapper';
import exportToTrf from '../../../backend/TrfxParser/exportToTrf';
import parseTrfFile from '../../../backend/TrfxParser/parseTrfFile';

test('Parse sample file', (done) => {
  const dirPath = path.join(__dirname, '/testTrfFile.txt');

  readFile(dirPath, 'utf8')
    .then((data) => {
      const tournament = parseTrfFile(data);
      if (!('parsingErrors' in tournament)) {
        const trfOutput = exportToTrf(
          tournament.trfxData,
          { exportForPairing: true, forRound: 0 }
        );
        if (trfOutput !== undefined) {
          return trfOutput;
        }
      }
      return Promise.reject(new Error('Unable to parse or export to TRF file'));
    })
    .then((trfOutput) => {
      const bbpPairingsWrapper = new BbpPairingsWrapper();
      bbpPairingsWrapper.init()
        .then(() => {
          const bbpResult = bbpPairingsWrapper.invoke(trfOutput);
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
