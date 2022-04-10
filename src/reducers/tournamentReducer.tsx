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
import { h } from 'preact';
import { toast } from 'react-toastify';

import { IFormData } from 'hooks/useTournamentFormData';
import { arrayEquals, cyrb53 } from 'utils/common';

import { I18nKey } from '../types/react-i18next';

import BbpPairings, { StatusCode } from '#/BbpPairings/bbpPairings';
import exportToTrf from '#/DataExport/exportToTrf';
import { TournamentStateJson } from '#/JsonImport';
import checkPairingsFilled from '#/Pairings/checkPairingsFilled';
import { readPairs } from '#/Pairings/Pairings';
import { ValidTrfData } from '#/TrfxParser/parseTrfFile';
import { getDetails, isError } from '#/types/ParseResult';
import Tournament, {
  Color,
  Configuration,
  GameResult,
  PairsRound,
  Player,
  PlayersRecord,
} from '#/types/Tournament';
import { evenUpGamesHistory, evenUpGamesHistoryPlayer } from '#/utils/GamesUtils';
import { computeResult, ResultType } from '#/utils/ResultUtils';
import {
  createDefaultConfiguration,
  createDefaultTournamentData,
  getPlayers,
  recalculatePlayerScores,
  recalculatePlayerTiebreakers,
  recalculateScores,
  recalculateTiebreakers,
} from '#/utils/TournamentUtils';
import { PlayerData } from '@/PlayerDetails/PlayerForm';

import { RootState } from '@/store';
import { DelayedToastData, dismissDelayedToast, showDelayedToast } from '@/ToastHandler';
import TransText from '@/TransText';

const verifyNextRoundConditions = (
  playedRounds: number, { expectedRounds }: Configuration, players: PlayersRecord,
): I18nKey | undefined => {
  const allFilled = checkPairingsFilled(players, playedRounds);
  if (!allFilled) {
    return 'Not filled results error';
  }

  if (playedRounds >= expectedRounds) {
    return 'All rounds played error';
  }
};

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
  pairs?: Array<PairsRound>,
  view: ViewState,
}

const initialState: TournamentState = {
  view: {
    selectedRound: 0,
  },
};

type SetResultType =
  | { round?: number, pairNo: number, type: ResultType }
  | { round?: number, pairNo: number, type: { w: GameResult, b: GameResult }};

type AsyncThunkConfig = {
  state: { tournament: TournamentState },
  rejectValue: {
    reason: string | I18nKey,
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
      return thunkAPI.rejectWithValue({ reason: 'No tournament active error' });
    }

    const playedRounds = pairs.length;

    const verifyError = verifyNextRoundConditions(playedRounds, configuration, players.index);

    if (verifyError) {
      return thunkAPI.rejectWithValue({ reason: verifyError, isValidationError: true });
    }

    const playersToIter = getPlayers(players.index,
      players.orderById, players.orderByPosition, configuration.matchByRank);

    const trfOutput = exportToTrf({
      tournament,
      players: playersToIter,
      configuration,
      forRound: playedRounds,
      exportForPairing: true
    });

    if (trfOutput === undefined) {
      return thunkAPI.rejectWithValue({ reason: 'BbpPairings export error' });
    }


    const toastId = showDelayedToast(() => toast.loading(<TransText i18nKey="Generating new round" />), 500);
    try {
      const bbpInstance = await BbpPairings.getInstance();
      const bbpOutput = bbpInstance.invoke(trfOutput);
      if (bbpOutput.statusCode !== 0) {
        let reason: string;
        if (bbpOutput.statusCode === StatusCode.NoValidPairing) {
          reason = 'No valid pairings error';
        } else {
          reason = bbpOutput.errorOutput.join('\n');
        }
        return thunkAPI.rejectWithValue({ reason, toastId });
      }
      return {
        data: bbpOutput.data,
        toastId
      };
    } catch {
      return thunkAPI.rejectWithValue({ reason: 'Initialization error', toastId });
    }
  }
);

function asPositiveOrUndefined(value?: number) {
  return (!value || isNaN(value) || value <= 0)
    ? undefined
    : value;
}

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

      state.tournament.id = cyrb53(JSON.stringify(state), Date.now()).toString(16);
    },
    loadNewFromJson: (state, { payload }: PayloadAction<TournamentStateJson>) => {
      state.tournament = payload.tournament;
      state.configuration = payload.configuration;
      state.players = payload.players;
      state.pairs = payload.pairs;
      state.view = payload.view;

      if (state.tournament && !state.tournament.id) {
        state.tournament.id = cyrb53(JSON.stringify(state), Date.now()).toString(16);
      }
    },
    createTournament: (state, { payload }: PayloadAction<IFormData>) => {
      const { numberOfRounds, ...tournamentData } = payload.general;
      const configurationData: Partial<Configuration> = {
        expectedRounds: numberOfRounds,
        tiebreakers: payload.tiebreakers,
        initialColor: payload.matchmaking.initialColor,
        useBakuAcceleration: payload.matchmaking.useBakuAcceleration,
      };

      state.tournament = createDefaultTournamentData(tournamentData);
      state.configuration = {
        ...createDefaultConfiguration(),
        ...configurationData
      };
      state.players = {
        index: {},
        orderById: [],
        orderByPosition: [],
      };
      state.pairs = [];
      state.view = {
        selectedRound: 1,
      };

      state.tournament.id = cyrb53(JSON.stringify(state), Date.now()).toString(16);
    },
    updateTournament: (state, { payload }: PayloadAction<IFormData>) => {
      if (!state.tournament || !state.configuration || !state.players) {
        return;
      }

      const tiebreakersChanged = !arrayEquals(state.configuration.tiebreakers, payload.tiebreakers);
      const { numberOfRounds, ...tournamentData } = payload.general;
      const configurationData: Partial<Configuration> = {
        expectedRounds: numberOfRounds,
        tiebreakers: payload.tiebreakers,
        initialColor: payload.matchmaking.initialColor,
        useBakuAcceleration: payload.matchmaking.useBakuAcceleration,
      };

      state.tournament = Object.assign(
        state.tournament,
        tournamentData as Partial<Tournament>
      );
      state.configuration = Object.assign(
        state.configuration,
        configurationData
      );

      if (tiebreakersChanged) {
        const players = state.players;
        recalculatePlayerTiebreakers(players.index, state.configuration);
      }
    },
    close: (state) => {
      state.tournament = undefined;
      state.configuration = undefined;
      state.players = undefined;
      state.pairs = undefined;
    },
    selectNextRound: (state) => {
      const { view, pairs } = state;
      if (pairs && view.selectedRound < pairs.length - 1) {
        view.selectedRound += 1;
      }
    },
    selectPrevRound: (state) => {
      const { view, pairs } = state;
      if (pairs && view.selectedRound > 0) {
        view.selectedRound -= 1;
      }
    },
    selectRound: (state, { payload }: PayloadAction<number>) => {
      const { view, pairs } = state;
      if (pairs && payload >= 0 && payload < pairs.length) {
        view.selectedRound = payload;
      }
    },
    setInitialColor: (state, action: PayloadAction<Color>) => {
      if (!state.configuration) {
        return;
      }

      let color = action.payload;
      if (color === Color.NONE) {
        color = cyrb53(JSON.stringify(state)) > 2_147_483_647
          ? Color.WHITE
          : Color.BLACK;
      }

      state.configuration.initialColor = color;
    },
    setResult: (state, action: PayloadAction<SetResultType>) => {
      const { pairs, players, configuration, view } = state;

      if (!pairs || !players || !configuration) {
        return;
      }

      const round = action.payload.round ?? view.selectedRound;
      if (round > (pairs.length - 1)) {
        return;
      }

      const { pairNo, type } = action.payload;

      const pairElement = pairs[round][pairNo - 1];
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

      recalculatePlayerTiebreakers(players.index, configuration, round);
    },
    addOrUpdatePlayer: ({ players, pairs, configuration }, { payload }: PayloadAction<PlayerData>) => {
      if (!players || !pairs || !configuration) {
        return;
      }

      // Convert string to numbers
      const notPlayed = payload.notPlayed.map(val => +val);
      payload.withdrawn = asPositiveOrUndefined(payload.withdrawn);
      payload.late = asPositiveOrUndefined(payload.late);

      const player = players.index[payload.id];

      if (!player) {
        const newPlayer = {
          ...payload,
          scores: [],
          games: [],
          notPlayed,
        } as Player;
        players.index[payload.id] = newPlayer;
        players.orderById.push(payload.id);
        players.orderById.sort((a, b) => a - b);

        players.orderByPosition.push(payload.id);

        evenUpGamesHistoryPlayer(newPlayer, pairs.length);
        recalculateScores(newPlayer, configuration);
        recalculateTiebreakers(newPlayer, players.index, configuration);
      } else {
        const currentNotPlayed = notPlayed.filter(value => value > pairs.length);
        const pastNotPlayed = player.notPlayed.filter(value => value <= pairs.length);
        currentNotPlayed.push(...pastNotPlayed);
        Object.assign(players.index[payload.id], payload, { notPlayed: currentNotPlayed });
      }
    },
    deletePlayer: ({ players, pairs }, { payload }: PayloadAction<{ index: number, reorderIds: boolean }>) => {
      if (!players || !pairs) {
        return;
      }

      delete players.index[payload.index];
      players.orderById = players.orderById.filter(value => value !== payload.index);
      players.orderByPosition = players.orderByPosition.filter(value => value !== payload.index);

      if (payload.reorderIds) {
        const keyValueMap = players.orderById.reduce(((keyValue, value, index) => {
          const idx = index + 1;
          const player = players.index[value];
          if (idx !== player.id) {
            player.id = idx;
            delete players.index[value];
            players.index[idx] = player;
            keyValue[value] = idx;
          }
          return keyValue;
        }), {} as Partial<Record<number, number>>);

        // Re-map indexes
        players.orderById = players.orderById.map(value => keyValueMap[value] ?? value);
        players.orderByPosition = players.orderByPosition.map(value => keyValueMap[value] ?? value);

        // Re-map opponent IDs in players' games
        Object.entries(players.index).forEach(([, player]) => {
          player.games.forEach(game => {
            if (game.opponent) {
              game.opponent = keyValueMap[game.opponent] ?? game.opponent;
            }
          });
        });

        // Re-map IDs in pairs
        pairs.forEach(pairRound => pairRound.forEach(pair => {
          pair.white = keyValueMap[pair.white] ?? pair.white;
          pair.black = keyValueMap[pair.black] ?? pair.black;
        }));
      }
    },
    deleteRound: ({ pairs, players, configuration, view }) => {
      if (!pairs || !players || !configuration) {
        return;
      }

      const cutTo = pairs.length - 1;

      pairs.splice(cutTo, 1);

      Object.entries(players.index).forEach(([, player]) => {
        player.games.splice(cutTo, 1);
        player.scores.splice(cutTo, 1);
      });
      recalculatePlayerScores(players.index, configuration);

      if (view.selectedRound >= pairs.length) {
        view.selectedRound = pairs.length - 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createNextRound.fulfilled, (state, { payload }) => {
      dismissDelayedToast(payload.toastId);

      const { tournament, configuration, pairs, players, view } = state;

      if (!tournament || !players || !pairs || !configuration) {
        return;
      }

      // Determine last player in upper bracket for Baku Acceleration, for future pairings
      if (configuration.useBakuAcceleration) {
        if (configuration.bakuAccelerationLastGAPlayer === undefined) {
          const playersToIter = getPlayers(players.index,
            players.orderById, players.orderByPosition, configuration.matchByRank);

          const lastGA = Math.ceil(playersToIter.length / 4) * 2;
          configuration.bakuAccelerationLastGAPlayer = playersToIter[lastGA].id;
        }
      }

      const pairsParser = readPairs({
        players: players.index,
        pairsRaw: payload.data
      });
      const result = pairsParser.apply(pairs);

      if (isError(result)) {
        toast.error(getDetails(result));
        return;
      }

      evenUpGamesHistory(players.index, pairs.length);
      recalculatePlayerScores(
        players.index,
        configuration,
        pairs.length);

      view.selectedRound = pairs.length - 1;

      toast(<TransText i18nKey="Pairings done" />, {
        type: toast.TYPE.SUCCESS,
      });
    });
    builder.addCase(createNextRound.rejected, (_, action) => {
      action.payload?.toastId && dismissDelayedToast(action.payload.toastId);

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('An error has occurred during next round creation. Error details:', action.error);
      }

      const reason = action.payload?.reason ?? 'Unknown error';

      if (action.payload?.isValidationError) {
        toast.warning(<TransText i18nKey={reason} />);
      } else {
        toast.error(<TransText i18nKey={reason} />);
      }
    });
  },
});

export const {
  loadNew, loadNewFromJson, createTournament, updateTournament, close,
  selectNextRound, selectPrevRound, selectRound, setInitialColor, setResult,
  addOrUpdatePlayer, deletePlayer, deleteRound
} = tournamentSlice.actions;

export { createNextRound };

export const selectTournament = (state: RootState) => state.tournament.tournament;
export const selectConfiguration = (state: RootState) => state.tournament.configuration;
export const selectPlayers = (state: RootState) => state.tournament.players;
export const selectPairs = (state: RootState) => state.tournament.pairs;
export const selectViewOptions = (state: RootState) => state.tournament.view;

export default tournamentSlice.reducer;
