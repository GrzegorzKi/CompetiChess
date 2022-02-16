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

import { ParsingErrors, ValidTrfData } from '#/TrfxParser/parseTrfFile';
import { getMessageForWarnCode } from '#/types/WarnCode';

interface Props {
  data?: ValidTrfData,
  errors?: ParsingErrors,
}

const TrfxParseSummary: FunctionalComponent<Props> = ({ data , errors }) => {
  if (!data?.warnings.length && !errors) {
    return null;
  }

  return (
    <>
      {data?.warnings.length
        ? (
          <ul>
            {data.warnings.map((value, index) => <li key={index}>{getMessageForWarnCode(value)}</li>)}
          </ul>
        )
        : null
      }
      {errors
        ? (
          <ul>
            {errors.parsingErrors.map((value, index) => <li key={index}>{value}</li>)}
          </ul>
        )
        : null
      }
    </>
  );
};

export default TrfxParseSummary;
