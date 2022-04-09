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

import { ComponentChildren, FunctionalComponent, h } from 'preact';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'hooks/index';
import { selectTournament } from 'reducers/tournamentReducer';

import style from './style.scss';

function getDatesString<T>(dateOfStart: T, dateOfEnd: T) {
  return (dateOfStart === dateOfEnd || !dateOfEnd)
    ? dateOfStart
    : `${dateOfStart} / ${dateOfEnd}`;
}

interface IProps {
  children: ComponentChildren;
}

const PrintHeader: FunctionalComponent<IProps> = ({ children }) => {
  const { t } = useTranslation();
  const tournament = useAppSelector(selectTournament);

  if (!tournament) {
    return null;
  }

  const dates = getDatesString(tournament.dateOfStart, tournament.dateOfEnd);

  return (
    <div class="print-only">
      <div class="centered">
        <span class="is-size-4 mb-2">
          <b>{tournament.tournamentName}</b>
        </span>
        <span>
          <b>{tournament.city}, {dates}</b>
          {tournament.rateOfPlay ?
            <>
              <br />
              <b>{t('Rate of play')}: {tournament.rateOfPlay}</b>
            </>
            : null}
          {tournament.chiefArbiter ?
            <>
              <br />
              <b>Arbiter: {tournament.chiefArbiter}</b>
            </>
            : null}
        </span>
        <span class="is-size-5 mt-1">
          {children}
        </span>
      </div>
      <hr class={style.hrTop} />
    </div>
  );
};

export default PrintHeader;
