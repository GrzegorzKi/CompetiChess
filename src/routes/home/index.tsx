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

import style from './style.scss';

import parseTrfFile, {
  isTournamentValid,
  ParseTrfFileResult,
  ValidTrfData,
} from '#/TrfxParser/parseTrfFile';

import FileSelector from '@/FileSelector';
import NextRoundButton from '@/NextRoundButton/NextRoundButton';
import PairsView from '@/PairsView';
import TrfxParseSummary from '@/TrfxParseSummary';

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

  async function processNextRound(data: ValidTrfData) {
    setForceRound(data.trfxData.playedRounds - 1);
  }

  return (
    <div class={style.home}>
      <FileSelector fileHandler={fileHandler} />
      <TrfxParseSummary data={tournament} />
      {isTournamentValid(tournament)
        ? <>
          <NextRoundButton tournament={tournament} onSuccess={processNextRound}><strong>Start next round</strong></NextRoundButton>
          <PairsView data={tournament.trfxData} forceRound={forceRound} />
        </>
        : null
      }
    </div>
  );
};

export default Home;
