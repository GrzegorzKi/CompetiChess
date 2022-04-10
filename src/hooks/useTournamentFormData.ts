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

import { IMatchmakingFormInputs } from 'features/TournamentSettings/MatchmakingForm';
import { ISortingDefaultValues } from 'features/TournamentSettings/SortingForm';
import { IGeneralFormInputs } from 'features/TournamentSettings/TournamentForm';
import { useAppSelector } from 'hooks/index';
import { selectConfiguration, selectTournament } from 'reducers/tournamentReducer';

import Tiebreaker from '#/types/Tiebreaker';
import { Color } from '#/types/Tournament';


export interface IFormData {
  general: IGeneralFormInputs;
  tiebreakers: Tiebreaker[];
  matchmaking: IMatchmakingFormInputs;
  sorters: ISortingDefaultValues;
}

const useTournamentFormData = (loadDefault = false): IFormData => {
  const tournament = useAppSelector(selectTournament);
  const configuration = useAppSelector(selectConfiguration);

  if (!tournament || !configuration || loadDefault) {
    return {
      general: {
        createdDate: 0,
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
      matchmaking: {
        initialColor: Color.NONE,
        useBakuAcceleration: false,
      },
      sorters: {
        keepNumbersOnSort: false,
        shuffleEntries: true,
        sorters: [],
      },
    };
  }

  const { createdDate, tournamentName, city, federation, dateOfStart, dateOfEnd, tournamentType, chiefArbiter, rateOfPlay } = tournament;
  const { expectedRounds, tiebreakers, useBakuAcceleration, initialColor, sorters, keepNumbersOnSort, shuffleEntries } = configuration;

  return {
    general: {
      createdDate,
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
    tiebreakers,
    matchmaking: {
      initialColor,
      useBakuAcceleration: useBakuAcceleration ?? false,
    },
    sorters: {
      keepNumbersOnSort,
      shuffleEntries,
      sorters,
    },
  };
};

export default useTournamentFormData;
