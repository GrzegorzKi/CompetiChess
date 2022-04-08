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
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useAppSelector } from 'hooks/index';
import { selectIsModified } from 'reducers/flagsReducer';
import { loadNew } from 'reducers/tournamentReducer';

import { loadFile } from 'utils/fileUtils';
import { blockIfModified } from 'utils/modalUtils';

import { useModalContext } from '../ModalProvider';

import parseTrfFile, {
  isTournamentValid,
  ParsingErrors,
  ValidTrfData,
} from '#/TrfxParser/parseTrfFile';
import { getMessageForWarnCode } from '#/types/WarnCode';
import FileSelector from '@/FileSelector';
import { store } from '@/store';
import TransText from '@/TransText';

interface ILoadedMessageProps {
  result: ValidTrfData;
}

const LoadedMessage = ({ result }: ILoadedMessageProps) => {
  const { t } = useTranslation();

  const successText = (<Trans i18nKey="Tournament loaded">
    Tournament <strong>{{ name: result.tournament.tournamentName }}</strong> loaded successfully!
  </Trans>);

  if (result.warnings.length === 0) {
    return successText;
  }

  return <>
    {successText}
    <hr />
    {t('Warnings were generated:')}
    <ul class="ul">
      {result.warnings.map((value, index) => (
        <li key={index}>{getMessageForWarnCode(value)}</li>
      ))}
    </ul>
  </>;
};

interface IErrorMessageProps {
  result: ParsingErrors;
}

const ErrorMessage = ({ result }: IErrorMessageProps) => {
  const { t } = useTranslation();

  return <>
    {t('Unable to load TRFx')}
    <ul class="ul">
      {result.parsingErrors.map((value, index) => (
        <li key={index}>{value}</li>
      ))}
    </ul>
  </>;
};

function loadTrfxTournament(files: FileList) {
  loadFile(files[0])
    .then((data) => {
      const result = parseTrfFile(data);
      if (isTournamentValid(result)) {
        store.dispatch(loadNew(result));
        if (result.warnings.length === 0) {
          toast.success(<LoadedMessage result={result} />);
        } else {
          toast.warning(<LoadedMessage result={result} />);
        }
      } else {
        toast.error(<ErrorMessage result={result} />);
      }
    })
    .catch(() => {
      toast.error(<TransText i18nKey='Unable to load TRFx' />);
    });
}

const ImportTrfxTournamentButton: FunctionalComponent = () => {
  const { t } = useTranslation();

  const isModified = useAppSelector(selectIsModified);
  const { onSaveGuard } = useModalContext();

  const checkCurrentAndImportTournament = useCallback(async (files: FileList) => {
    if (onSaveGuard && await blockIfModified(isModified, onSaveGuard)) {
      loadTrfxTournament(files);
    }
  }, [isModified, onSaveGuard]);

  return (
    <FileSelector fileHandler={checkCurrentAndImportTournament} className="button">
      {t('Import TRFx file')}
    </FileSelector>
  );
};

export default ImportTrfxTournamentButton;
