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

import { h, FunctionalComponent } from 'preact';

import Tournament from '#/types/Tournament';
import WarnCode, { getMessageForWarnCode } from '#/types/WarnCode';

interface Props {
  tournament?: Tournament,
  warnings?: WarnCode[],
  parsingErrors?: string[],
}

const TrfxParseSummary: FunctionalComponent<Props> = ({ tournament , warnings, parsingErrors }) => {
  if (!tournament && !warnings && !parsingErrors) {
    return null;
  }

  const _warnings = warnings?.length
    ? (
      <ul>
        {warnings.map((value, index) => <li key={index}>{getMessageForWarnCode(value)}</li>)}
      </ul>
    )
    : null;

  const errors = parsingErrors
    ? (
      <ul>
        {parsingErrors.map((value, index) => <li key={index}>{value}</li>)}
      </ul>
    )
    : null;

  return (
    <>
      {tournament ? <p>Currently tournament: <strong>{tournament.tournamentName}</strong></p> : null}
      {_warnings}
      {errors}
    </>
  );
};

export default TrfxParseSummary;
