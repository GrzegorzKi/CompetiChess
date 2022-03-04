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

import { h } from 'preact';
import { useState } from 'preact/hooks';

import { useAppDispatch } from 'hooks';
import { close, loadNew } from 'reducers/tournamentReducer';

import parseTrfFile, { isTournamentValid } from '#/TrfxParser/parseTrfFile';
import WarnCode from '#/types/WarnCode';

import ExportTournamentButton from '@/ExportTournamentButton';
import FileSelector from '@/FileSelector';
import ImportTournamentButton from '@/ImportTournamentButton';
import TrfxParseSummary from '@/TrfxParseSummary';

const CreateTournament = (): JSX.Element => {
  const dispatch = useAppDispatch();

  const [parseErrors, setParseErrors] = useState<string[]>();
  const [warnings, setWarnings] = useState<WarnCode[]>();

  function loadTrfxTournament(files: FileList) {
    if (files.length > 0) {
      const fr = new FileReader();

      fr.addEventListener('loadend', (e) => {
        const target = e.target;
        if (target && typeof target.result === 'string') {
          const result = parseTrfFile(target.result);
          if (isTournamentValid(result)) {
            dispatch(loadNew(result));
            setWarnings(result.warnings);
            setParseErrors(undefined);
          } else {
            dispatch(close());
            setWarnings(undefined);
            setParseErrors(result.parsingErrors);
          }
        }
      });

      fr.readAsBinaryString(files[0]);
    }
  }

  return (
    <div>
      <FileSelector fileHandler={loadTrfxTournament}>
        <strong>Choose a file or drop it here</strong>
      </FileSelector>
      <TrfxParseSummary warnings={warnings} parsingErrors={parseErrors} />
      <ExportTournamentButton />
      <ImportTournamentButton />
    </div>
  );
};

export default CreateTournament;
