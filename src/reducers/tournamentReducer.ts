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

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

import BbpPairings from '#/BbpPairings/bbpPairings';
import exportToTrf from '#/DataExport/exportToTrf';
import checkPairingsFilled from '#/Pairings/checkPairingsFilled';
import { Pair, readPairs } from '#/Pairings/Pairings';
import { ValidTrfData } from '#/TrfxParser/parseTrfFile';
import { getDetails, isError } from '#/types/ParseResult';
import Tournament, { Configuration, Player } from '#/types/Tournament';
import { evenUpGamesHistory } from '#/utils/GamesUtils';
import { getPlayers, recalculatePlayerScores } from '#/utils/TournamentUtils';

import { RootState } from '@/store';

const verifyNextRoundConditions = (
  { playedRounds }: Tournament, pairs: Array<Pair[]>, { expectedRounds }: Configuration
): string | undefined => {
  const allFilled = checkPairingsFilled(pairs[playedRounds - 1], playedRounds);
  if (!allFilled) {
    return 'Cannot start new round. Please fill in all pairs\' results before proceeding.';
  }

  if (playedRounds >= expectedRounds) {
    return 'This is the last round in tournament. Cannot start new round.';
  }
};

const errorHandlerAction = (payload: string): PayloadAction<string> => (
  {
    payload,
    type: 'tournament/errorHandler'
  }
);

export interface TournamentState {
  tournament?: Tournament,
  configuration?: Configuration,
  players?: {
    byId: Player[],
    allIdsByPosition: number[]
  },
  pairs?: Array<Pair[]>,
  view: {
    selectedRound: number,
  },
  error?: string,
}

const initialState: TournamentState = {
  view: {
    selectedRound: 0,
  },
};

type AsyncThunkConfig = {
  state: { tournament: TournamentState },
  rejectValue: {
    reason: string
    isValidationError?: boolean
  },
}

const createNextRound = createAsyncThunk<string[], void, AsyncThunkConfig>(
  'tournament/createNextRound',
  async (_, thunkAPI) => {
    const { tournament, configuration, pairs, players } = thunkAPI.getState().tournament;

    if (!tournament || !players || !pairs || !configuration) {
      return thunkAPI.rejectWithValue({ reason: 'There is no tournament active. Cannot start new round.' });
    }

    const verifyError = verifyNextRoundConditions(tournament, pairs, configuration);

    if (verifyError) {
      return thunkAPI.rejectWithValue({ reason: verifyError, isValidationError: true });
    }

    const playersToIter = getPlayers(players.byId,
      players.allIdsByPosition, configuration.matchByRank);

    const trfOutput = exportToTrf({
      tournament,
      players: playersToIter,
      configuration,
      exportForPairing: true
    });

    if (trfOutput === undefined) {
      return thunkAPI.rejectWithValue({ reason: 'Unable to generate output for BbpPairings engine.' });
    }

    try {
      const bbpInstance = await BbpPairings.getInstance();
      const bbpOutput = bbpInstance.invoke(trfOutput);
      if (bbpOutput.statusCode !== 0) {
        return thunkAPI.rejectWithValue({ reason: bbpOutput.errorOutput.join('\n') });
      }
      return bbpOutput.data;
    } catch {
      return thunkAPI.rejectWithValue({ reason: 'Application encountered an error while initializing BbpPairings engine.\nIf the problem persists, please restart the app.' });
    }
  }
);

export const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    loadNew: (state, action: PayloadAction<ValidTrfData>) => {
      state.tournament = action.payload.tournament;
      state.configuration = action.payload.configuration;
      state.players = {
        byId: action.payload.players,
        allIdsByPosition: action.payload.playersByPosition,
      };
      state.pairs = action.payload.pairs;
      state.view.selectedRound = 0;
    },
    close: (state) => {
      state.tournament = undefined;
      state.configuration = undefined;
      state.players = undefined;
      state.pairs = undefined;
    },
    selectNextRound: ({ view, tournament }) => {
      if (tournament && view.selectedRound < tournament.playedRounds - 1) {
        view.selectedRound += 1;
      }
    },
    selectPrevRound: ({ view, tournament }) => {
      if (tournament && view.selectedRound > 0) {
        view.selectedRound -= 1;
      }
    },
    selectRound: ({ view, tournament }, { payload }: PayloadAction<number>) => {
      if (tournament && payload >= 0 && payload < tournament.playedRounds) {
        view.selectedRound = payload;
      }
    },
    errorHandler: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      toast.error(state.error);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(createNextRound.fulfilled, (state, action) => {
      const { tournament, configuration, pairs, players, view } = state;

      if (!tournament || !players || !pairs || !configuration) {
        return;
      }

      const pairsParser = readPairs({
        players: players.byId,
        pairsRaw: action.payload
      });
      const result = pairsParser.apply(pairs);
      if (isError(result)) {
        tournamentSlice.caseReducers.errorHandler(state,
          errorHandlerAction(getDetails(result)));
        return;
      }

      evenUpGamesHistory(players.byId, tournament.playedRounds);
      recalculatePlayerScores(
        players.byId,
        configuration,
        tournament.playedRounds);

      tournament.playedRounds += 1;
      view.selectedRound = tournament.playedRounds - 1;

      // Reset error and return modified values
      toast('Next round pairings are ready!', {
        type: toast.TYPE.SUCCESS,
      });
      state.error = undefined;
    }
    );
    builder.addCase(createNextRound.rejected, (state, action) => {
      const reason = action.payload?.reason ?? 'Unknown error occurred';
      if (action.payload?.isValidationError) {
        state.error = reason;
        toast.warning(state.error);
      } else {
        tournamentSlice.caseReducers.errorHandler(state, errorHandlerAction(reason));
      }
    });
  },
});

export const { loadNew, close, selectNextRound, selectPrevRound, selectRound, errorHandler } = tournamentSlice.actions;
export { createNextRound };

export const selectTournament = (state: RootState) => state.tournament.tournament;
export const selectConfiguration = (state: RootState) => state.tournament.configuration;
export const selectPlayers = (state: RootState) => state.tournament.players;
export const selectPairs = (state: RootState) => state.tournament.pairs;
export const selectViewOptions = (state: RootState) => state.tournament.view;

export default tournamentSlice.reducer;
