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

import { cyrb53 } from 'utils/common';

import BbpPairings from '#/BbpPairings/bbpPairings';
import exportToTrf from '#/DataExport/exportToTrf';
import { TournamentStateJson } from '#/JsonImport';
import checkPairingsFilled from '#/Pairings/checkPairingsFilled';
import { readPairs } from '#/Pairings/Pairings';
import { ValidTrfData } from '#/TrfxParser/parseTrfFile';
import { getDetails, isError } from '#/types/ParseResult';
import Tournament, { Configuration, Pair, Player, PlayersRecord } from '#/types/Tournament';
import { evenUpGamesHistory } from '#/utils/GamesUtils';
import { computeResult, ResultType } from '#/utils/ResultUtils';
import {
  getPlayers,
  recalculatePlayerScores,
  recalculateScores,
  recalculateTiebreakers,
} from '#/utils/TournamentUtils';

import { RootState } from '@/store';
import { DelayedToastData, dismissDelayedToast, showDelayedToast } from '@/ToastHandler';

const verifyNextRoundConditions = (
  { playedRounds }: Tournament, { expectedRounds }: Configuration, players: PlayersRecord,
): string | undefined => {
  const allFilled = checkPairingsFilled(players, playedRounds);
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

export interface PlayersState {
  index: Record<number, Player>,
  orderById: number[],
  orderByPosition: number[],
}

export interface ViewState {
  selectedRound: number,
}

export interface TournamentState {
  tournament?: Tournament,
  configuration?: Configuration,
  players?: PlayersState,
  pairs?: Array<Pair[]>,
  view: ViewState,
  error?: string,
}

const initialState: TournamentState = {
  view: {
    selectedRound: 0,
  },
};

type SetResultType = { round?: number, pairNo: string, type: ResultType };

type AsyncThunkConfig = {
  state: { tournament: TournamentState },
  rejectValue: {
    reason: string,
    toastId?: React.ReactText | DelayedToastData,
    isValidationError?: boolean,
  },
}

type CreateNextRoundReturned = {
  data: string[],
  toastId: React.ReactText | DelayedToastData,
}

const createNextRound = createAsyncThunk<CreateNextRoundReturned, void, AsyncThunkConfig>(
  'tournament/createNextRound',
  async (_, thunkAPI) => {
    const { tournament, configuration, pairs, players } = thunkAPI.getState().tournament;

    if (!tournament || !players || !pairs || !configuration) {
      return thunkAPI.rejectWithValue({ reason: 'There is no tournament active. Cannot start new round.' });
    }

    const verifyError = verifyNextRoundConditions(tournament, configuration, players.index);

    if (verifyError) {
      return thunkAPI.rejectWithValue({ reason: verifyError, isValidationError: true });
    }

    const playersToIter = getPlayers(players.index,
      players.orderById, players.orderByPosition, configuration.matchByRank);

    const trfOutput = exportToTrf({
      tournament,
      players: playersToIter,
      configuration,
      exportForPairing: true
    });

    if (trfOutput === undefined) {
      return thunkAPI.rejectWithValue({ reason: 'Unable to generate output for BbpPairings engine.' });
    }


    const toastId = showDelayedToast(() => toast.loading('Generating new round'), 500);
    try {
      const bbpInstance = await BbpPairings.getInstance();
      const bbpOutput = bbpInstance.invoke(trfOutput);
      if (bbpOutput.statusCode !== 0) {
        return thunkAPI.rejectWithValue({ reason: bbpOutput.errorOutput.join('\n'), toastId });
      }
      return {
        data: bbpOutput.data,
        toastId
      };
    } catch {
      return thunkAPI.rejectWithValue({ reason: 'Application has encountered an error while initializing BbpPairings engine.\nIf the problem persists, please restart the app.', toastId });
    }
  }
);

export const tournamentSlice = createSlice({
  name: 'tournament',
  initialState,
  reducers: {
    loadNew: (state, { payload }: PayloadAction<ValidTrfData>) => {
      state.tournament = payload.tournament;
      state.configuration = payload.configuration;
      state.players = {
        index: payload.players,
        orderById: payload.playersById,
        orderByPosition: payload.playersByPosition,
      };
      state.pairs = payload.pairs;
      state.view = {
        selectedRound: 0,
      };

      state.tournament.id = cyrb53(JSON.stringify(state)).toString(16);
    },
    loadNewFromJson: (state, { payload }: PayloadAction<TournamentStateJson>) => {
      state.tournament = payload.tournament;
      state.configuration = payload.configuration;
      state.players = payload.players;
      state.pairs = payload.pairs;
      state.view = payload.view;

      if (state.tournament && !state.tournament.id) {
        state.tournament.id = cyrb53(JSON.stringify(state)).toString(16);
      }
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
    },
    setResult: ({ pairs, players, configuration, view }, action: PayloadAction<SetResultType>) => {
      if (!pairs || !players || !configuration) {
        return;
      }

      const { pairNo, type } = action.payload;
      let { round } = action.payload;
      round ??= view.selectedRound;

      if (round >= pairs.length) {
        return;
      }

      const no = Number.parseInt(pairNo, 10) - 1;
      const pairElement = pairs[round][no];
      if (!pairElement) {
        return;
      }

      const white = players.index[pairElement.white];
      const black = players.index[pairElement.black];
      // Action should not change result of a pair without an opponent
      if (!black) {
        return;
      }

      const results = computeResult(type);
      white.games[round].result = results.w;
      black.games[round].result = results.b;

      recalculateScores(white, configuration, round);
      recalculateScores(black, configuration, round);

      const playerArray = players.orderById.map(i => players.index[i]);
      playerArray.forEach(player => {
        recalculateTiebreakers(player, playerArray, configuration, round);
      });
    }
  },
  extraReducers: (builder) => {
    builder.addCase(createNextRound.fulfilled, (state, { payload }) => {
      const { tournament, configuration, pairs, players, view } = state;

      if (!tournament || !players || !pairs || !configuration) {
        return;
      }

      const playersArray = players.orderById.map(i => players.index[i]);

      const pairsParser = readPairs({
        players: players.index,
        pairsRaw: payload.data
      });
      const result = pairsParser.apply(pairs);

      dismissDelayedToast(payload.toastId);

      if (isError(result)) {
        tournamentSlice.caseReducers.errorHandler(state,
          errorHandlerAction(getDetails(result)));
        return;
      }

      evenUpGamesHistory(players.index, tournament.playedRounds);
      recalculatePlayerScores(
        playersArray,
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
      action.payload?.toastId && dismissDelayedToast(action.payload.toastId);

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

export const { loadNew, loadNewFromJson, close, selectNextRound, selectPrevRound, selectRound, errorHandler, setResult } = tournamentSlice.actions;
export { createNextRound };

export const selectTournament = (state: RootState) => state.tournament.tournament;
export const selectConfiguration = (state: RootState) => state.tournament.configuration;
export const selectPlayers = (state: RootState) => state.tournament.players;
export const selectPairs = (state: RootState) => state.tournament.pairs;
export const selectViewOptions = (state: RootState) => state.tournament.view;

export default tournamentSlice.reducer;
