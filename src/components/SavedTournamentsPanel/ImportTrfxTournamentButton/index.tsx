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
import { useCallback } from 'preact/hooks';
import { toast } from 'react-toastify';

import { useAppSelector } from 'hooks/index';
import { selectIsModified } from 'reducers/flagsReducer';
import { loadNew } from 'reducers/tournamentReducer';

import { loadFile } from 'utils/fileUtils';
import { blockIfModified } from 'utils/modalUtils';

import parseTrfFile, {
  isTournamentValid,
  ParsingErrors,
  ValidTrfData,
} from '#/TrfxParser/parseTrfFile';
import { getMessageForWarnCode } from '#/types/WarnCode';
import FileSelector from '@/FileSelector';

import { useModalContext } from '@/ModalProvider';
import { store } from '@/store';

function createWarningMessage(successText: JSX.Element, result: ValidTrfData) {
  return <>
    {successText}
    <hr />
    Warnings were generated:
    <ul class="ul">
      {result.warnings.map((value, index) => (
        <li key={index}>{getMessageForWarnCode(value)}</li>
      ))}
    </ul>
  </>;
}

function createErrorMessage(result: ParsingErrors) {
  return <>
    Unable to load TRFx file:
    <ul class="ul">
      {result.parsingErrors.map((value, index) => (
        <li key={index}>{value}</li>
      ))}
    </ul>
  </>;
}

function loadTrfxTournament(files: FileList) {
  loadFile(files[0])
    .then((data) => {
      const result = parseTrfFile(data);
      if (isTournamentValid(result)) {
        store.dispatch(loadNew(result));
        const successText = <>Tournament <strong>{result.tournament.tournamentName}</strong> loaded successfully!</>;
        if (result.warnings.length === 0) {
          toast.success(successText);
        } else {
          toast.warning(createWarningMessage(successText, result));
        }
      } else {
        toast.error(createErrorMessage(result));
      }
    })
    .catch(() => {
      toast.error('Unable to load the file. Please try again.');
    });
}

const ImportTrfxTournamentButton: FunctionalComponent = () => {
  const isModified = useAppSelector(selectIsModified);
  const { onSaveGuard } = useModalContext();

  const checkCurrentAndImportTournament = useCallback(async (files: FileList) => {
    if (onSaveGuard && await blockIfModified(isModified, onSaveGuard)) {
      loadTrfxTournament(files);
    }
  }, [isModified, onSaveGuard]);

  return (
    <FileSelector fileHandler={checkCurrentAndImportTournament} className="button">
      Import TRFx file
    </FileSelector>
  );
};

export default ImportTrfxTournamentButton;
