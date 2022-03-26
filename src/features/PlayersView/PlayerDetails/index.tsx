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

import clone from 'just-clone';
import { FunctionalComponent, h } from 'preact';
import { useCallback, useMemo, useRef } from 'preact/hooks';
import { UseFormReturn } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { findFreeId } from 'features/PlayersView';
import { useAppDispatch, useAppSelector } from 'hooks/index';
import {
  addOrUpdatePlayer, PlayersState,
  selectPairs,
  selectPlayers,
} from 'reducers/tournamentReducer';

import PlayerForm, { PlayerData } from './PlayerForm';

import { createDefaultTrfPlayer } from '#/TrfxParser/parseTrfPlayer';
import Modal from '@/modals/Modal';


function getPlayerOrCreateNew(players: PlayersState | undefined, playerId: number): PlayerData {
  const player = players && players.index[playerId];
  if (player) {
    const cloned = clone(player);
    cloned.notPlayed.sort((a, b) => a - b);
    const notPlayed = cloned.notPlayed
      .map((val) => val.toString());
    return {
      ...cloned,
      notPlayed
    };
  }

  const id = (players && playerId === -1) ? findFreeId(players.orderById) : playerId;
  const newPlayer = createDefaultTrfPlayer(id);
  return Object.assign(newPlayer, { notPlayed: [] as string[] });
}

interface IProps {
  playerId: number,
  onClose: () => void;
  setIndex: (playerId: number) => void;
}

const PlayerDetails: FunctionalComponent<IProps> = ({ playerId, setIndex, onClose }) => {
  const pairs = useAppSelector(selectPairs);
  const players = useAppSelector(selectPlayers);
  const dispatch = useAppDispatch();

  const formRef = useRef<UseFormReturn<PlayerData>>();

  let index = players ? players.orderByPosition.findIndex(id => id === playerId) : -1;
  const title = index !== -1 ? 'Edit player' : 'Add player';

  index = (players && index === -1) ? players.orderByPosition.length : index;

  const player = useMemo(() => getPlayerOrCreateNew(players, playerId), [playerId, players]);

  const onApply = useCallback(async () => {
    if (formRef.current && await formRef.current.trigger()) {
      dispatch(addOrUpdatePlayer(formRef.current.getValues()));
      onClose();
    }
  }, [dispatch, onClose]);

  const prevPlayerFn = useCallback(async () => {
    if (players && index > 0) {
      if (formRef.current && await formRef.current.trigger()) {
        dispatch(addOrUpdatePlayer(formRef.current.getValues()));
        setIndex(players.orderByPosition[index - 1]);
      }
    }
  }, [dispatch, index, players, setIndex]);

  const nextPlayerFn = useCallback(async () => {
    if (players && index < players.orderByPosition.length - 1) {
      if (formRef.current && await formRef.current.trigger()) {
        dispatch(addOrUpdatePlayer(formRef.current.getValues()));
        setIndex(players.orderByPosition[index + 1]);
      }
    }
  }, [dispatch, index, players, setIndex]);

  const newPlayerFn = useCallback(async () => {
    if (players && formRef.current && await formRef.current.trigger()) {
      dispatch(addOrUpdatePlayer(formRef.current.getValues()));
      setIndex(-1);
    }
  }, [dispatch, players, setIndex]);

  if (!pairs || !players) {
    return null;
  }

  return (
    <>
      <header class="modal-card-head">
        <p class="modal-card-title">{title}</p>
        <button class="delete" aria-label="close" onClick={onClose} />
      </header>
      <section class="modal-card-body">
        <PlayerForm inputRef={formRef} defaultValues={player} values={player} />
      </section>
      <footer class="modal-card-foot" style="overflow-x: auto;">
        <button class="button is-success" onClick={() => onApply()}>OK</button>
        <button class="button is-outlined" onClick={onClose}>Cancel</button>
        <button class="button is-outlined is-info ml-auto" disabled={index < 1}
                onClick={prevPlayerFn}>Previous</button>
        {index < players.orderByPosition.length - 1
          ? <button class="button is-outlined is-info" onClick={nextPlayerFn}>Next</button>
          : <button class="button is-outlined is-success" onClick={newPlayerFn}>New</button>}
      </footer>
    </>
  );
};

interface IModalProps {
  playerId: number;
  setIndex: (index: number) => void;
}

const PlayerDetailsModal: FunctionalComponent<IModalProps> = ({ playerId, setIndex }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isOpen = !!state && 'selectedPlayer' in (state as any);

  const onClose = () => isOpen && navigate(-1);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit player modal"
    >
      <PlayerDetails
        playerId={playerId}
        setIndex={setIndex}
        onClose={onClose} />
    </Modal>
  );
};

export default PlayerDetailsModal;
