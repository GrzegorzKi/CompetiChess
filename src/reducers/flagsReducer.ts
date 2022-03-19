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

import { createSlice } from '@reduxjs/toolkit';

import { createNextRound, tournamentSlice } from './tournamentReducer';

import { RootState } from '@/store';

export interface IsModifiedState {
  isModified: boolean,
}

const initialState: IsModifiedState = {
  isModified: false,
};

export const flags = createSlice({
  name: tournamentSlice.name, // The same name as in `tournamentReducer.ts`
  initialState,
  reducers: {
    loadNew: () => {
      return { isModified: true };
    },
    loadNewFromJson: () => {
      return { isModified: true };
    },
    createTournament: () => {
      return { isModified: true };
    },
    clearIsModified: () => {
      return { isModified: false };
    },
    close: () => {
      return { isModified: false };
    },
    setResult: () => {
      return { isModified: true };
    }
  },
  extraReducers: (builder) => {
    builder.addCase(createNextRound.fulfilled, () => {
      return { isModified: true };
    });
  },
});

export const { loadNew, loadNewFromJson, clearIsModified, close, setResult } = flags.actions;
export { createNextRound };

export const selectIsModified = (state: RootState) => state.flags.isModified;

export default flags.reducer;
