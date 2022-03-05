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
import { toast } from 'react-toastify';

import { loadNewFromJson } from 'reducers/tournamentReducer';
import { loadFile } from 'utils/fileUtils';

import { importTournamentFromJson } from '#/JsonImport';
import FileSelector from '@/FileSelector';
import { store } from '@/store';

function importTournament(fileList: FileList) {
  loadFile(fileList[0])
    .then((json) => {
      const data = importTournamentFromJson(json);
      // Reset tournament ID - generate new to
      // avoid clashes with existing entries
      data.tournament.id = '';
      store.dispatch(loadNewFromJson(data));

      const successText = <>Tournament <strong>{data.tournament.tournamentName}</strong> loaded successfully!</>;
      toast.success(successText);
    })
    .catch(() => {
      toast.error('Provided invalid file or file content is not a JSON object');
    });
}

const ImportTournamentButton: FunctionalComponent = () => {
  return (
    <FileSelector fileHandler={importTournament} className="button">
      Import from JSON
    </FileSelector>
  );
};

export default ImportTournamentButton;
