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

import { FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';

import BbpPairings from '../../backend/BbpPairings/bbpPairings';
import exportToTrf from '../../backend/DataExport/exportToTrf';
import { readPairs } from '../../backend/Pairings/Pairings';
import parseTrfFile, {
  ParseTrfFileResult,
  ValidTrfData,
} from '../../backend/TrfxParser/parseTrfFile';
import { getDetails, isError } from '../../backend/types/ParseResult';
import FileSelector from '../../components/FileSelector';
import PairsView from '../../components/PairsView';
import TrfxParseSummary from '../../components/TrfxParseSummary';

import style from './style.scss';

function isTournamentValid(data?: ParseTrfFileResult): data is ValidTrfData {
  return data !== undefined && !('parsingErrors' in data);
}

const Home: FunctionalComponent = () => {
  const [tournament, setTournament] = useState<ParseTrfFileResult>();
  const [forceRound, setForceRound] = useState(0);

  function fileHandler(files: FileList) {
    if (files.length > 0) {
      const fr = new FileReader();

      fr.addEventListener('loadend', (e) => {
        const target = e.target;
        if (target && typeof target.result === 'string') {
          const result = parseTrfFile(target.result);
          setTournament(result);
          setForceRound(0);
        }
      });

      fr.readAsBinaryString(files[0]);
    }
  }

  async function startNextRound() {
    // TODO Verify whether all pairs have assigned results
    if (isTournamentValid(tournament)) {
      const trfOutput = exportToTrf(
        tournament.trfxData,
        { exportForPairing: true,
          forRound: tournament.trfxData.playedRounds + 1 }
      );

      const wrapper = await BbpPairings.init();
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

      tournament.trfxData.playedRounds += 1;

      setTournament(tournament);
      setForceRound(tournament.trfxData.playedRounds - 1);
    }
  }

  return (
    <div class={style.home}>
      <FileSelector fileHandler={fileHandler} />
      <TrfxParseSummary data={tournament} />
      {isTournamentValid(tournament)
        ? <>
          <button class="button is-primary trans-bg mb-5" onClick={startNextRound}><strong>Start next round</strong></button>
          <PairsView data={tournament.trfxData} forceRound={forceRound} />
        </>
        : null
      }
    </div>
  );
};

export default Home;
