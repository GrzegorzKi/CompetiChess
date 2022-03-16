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

import { useAppSelector } from 'hooks/index';
import { selectConfiguration, selectTournament } from 'reducers/tournamentReducer';

import Tiebreaker from '#/Tiebreaker/Tiebreaker';

import { IGeneralFormInputs } from '@/TournamentSettings/TournamentForm';

export interface IFormData {
  general: IGeneralFormInputs;
  tiebreakers: Tiebreaker[];
}

const useTournamentFormData = (): IFormData => {
  const tournament = useAppSelector(selectTournament);
  const configuration = useAppSelector(selectConfiguration);

  if (!tournament || !configuration) {
    return {
      general: {
        tournamentName: '',
        city: '',
        federation: '',
        dateOfStart: '',
        dateOfEnd: '',
        tournamentType: '',
        chiefArbiter: '',
        rateOfPlay: '',
        numberOfRounds: 9,
      },
      tiebreakers: [],
    };
  }

  const { tournamentName, city, federation, dateOfStart, dateOfEnd, tournamentType, chiefArbiter, rateOfPlay } = tournament;
  const { expectedRounds } = configuration;

  return {
    general: {
      tournamentName,
      city,
      federation,
      dateOfStart,
      dateOfEnd,
      tournamentType,
      chiefArbiter,
      rateOfPlay,
      numberOfRounds: expectedRounds,
    },
    tiebreakers: configuration.tiebreakers,
  };
};

export default useTournamentFormData;