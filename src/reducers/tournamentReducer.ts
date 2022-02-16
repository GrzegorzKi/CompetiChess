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

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ValidTrfData } from '#/TrfxParser/parseTrfFile';
import { RootState } from '@/store';

export interface TournamentState {
  value?: ValidTrfData;
}

const initialState: TournamentState = {
  value: undefined,
};

export const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    loadNew: (state, action: PayloadAction<ValidTrfData>) => {
      state.value = action.payload;
    },
    close: (state) => {
      state.value = undefined;
    }
  }
});

export const { loadNew, close } = tournamentSlice.actions;

export const selectTournament = (state: RootState) => state.tournament.value;

export default tournamentSlice.reducer;
