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

export function loadFile(file: File, callback: (data: string) => void): void;
export function loadFile(file: File): Promise<string>;
export function loadFile(file: File, callback?: (data: string) => void): void | Promise<string> {
  if (callback) {
    const fr = new FileReader();
    fr.addEventListener('loadend', (e) => {
      const target = e.target;
      if (target && typeof target.result === 'string') {
        callback(target.result);
      }
    });
    fr.readAsBinaryString(file);
  } else {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.addEventListener('loadend', (e) => {
        const target = e.target;
        if (target && typeof target.result === 'string') {
          resolve(target.result);
        }
      });
      fr.addEventListener('error', reject);
      fr.readAsBinaryString(file);
    });
  }
}

export function downloadFile(text: string, filename = 'data.txt', mimeType = 'plain/text'): void {
  const element = document.createElement('a');
  element.style.display = 'none';

  element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(text)}`);
  element.setAttribute('download', filename);

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
