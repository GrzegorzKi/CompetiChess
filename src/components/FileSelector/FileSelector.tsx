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

import { h, FunctionalComponent, JSX } from 'preact';
import { useState } from 'preact/hooks';

import style from './style.scss';

interface Props {
  fileHandler: (fileList: FileList) => void
}

const FileSelector: FunctionalComponent<Props> = ({ fileHandler }) => {
  const [isDrop, setIsDrop] = useState(false);

  const onDragOver = (event: JSX.TargetedDragEvent<HTMLElement>) => {
    setIsDrop(true);
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  };
  const onDragLeave = () => setIsDrop(false);

  const onDrop = (event: JSX.TargetedDragEvent<HTMLElement>) => {
    setIsDrop(false);
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      fileHandler(files);
    }
  };

  const onChange = (event: JSX.TargetedEvent<HTMLInputElement>) => {
    event.preventDefault();
    const files = event.currentTarget.files;
    if (files) {
      fileHandler(files);
    }
  };

  return <>
    <input class={`${style.inputFile} ${isDrop ? style.dropActive : ''}`}
           type="file" id="trfxFile" name="file"
           onChange={onChange}
    />
    <label class="button is-primary" htmlFor="trfxFile"
           onDragOver={onDragOver}
           onDragLeave={onDragLeave}
           onDrop={onDrop}>
      Choose a file or drop it here
    </label>
  </>;
};

export default FileSelector;
