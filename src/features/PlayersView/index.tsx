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

import { useMenuState } from '@szhsin/react-menu';
import { FunctionalComponent, h, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { toast } from 'react-toastify';

import DeletePlayerModal, { DeletePlayerReturn } from 'features/PlayersView/DeletePlayerModal';
import PlayersTable from 'features/PlayersView/PlayersTable';
import { useAppDispatch } from 'hooks/index';
import useElementFocus from 'hooks/useElementFocus';
import { usePromiseModalWithReturn } from 'hooks/usePromiseModal';
import {
  deletePlayer as deletePlayerAction,
  PlayersState,
  selectNextRound,
  selectPrevRound,
} from 'reducers/tournamentReducer';
import { isModalOpen } from 'utils/modalUtils';

import PlayerDetails from './PlayerDetails';
import PlayersContextMenu from './PlayersContextMenu';
import style from './style.scss';

import Modal from '@/modals/Modal';
import { store } from '@/store';

export function findFreeId(playersById: number[]): number {
  let i = 1;
  for (const id of playersById) {
    if (i !== id) {
      return i;
    }
    i += 1;
  }
  return i;
}

async function checkAndDeletePlayer(index: number, onDeleteGuard: () => Promise<DeletePlayerReturn | false>) {
  const players = store.getState().tournament.players;
  const dispatch = store.dispatch;

  if (!players) return;

  const player = players.index[index];

  for (const game of player.games) {
    // Check if player was assigned in pair with any player
    if (game.opponent !== undefined) {
      toast.error(<>Cannot delete player <strong>{player.name}</strong>. Delete player from existing pairings first before deleting.</>);
      return;
    }
  }

  const data = await onDeleteGuard();
  if (!data) {
    return;
  }

  dispatch(deletePlayerAction({ index, reorderIds: data.reorderIds }));
}

interface IProps {
  players: PlayersState;
}

const PlayersView: FunctionalComponent<IProps> = ({ players }) => {
  const dispatch = useAppDispatch();

  const [idx, setIdx] = useState(0);
  const [ref, setRef, focusOnNext, focusOnPrev, focusOnFirst, scrollParent] = useElementFocus<HTMLTableRowElement>({});

  const [menuState, toggleMenu] = useMenuState({ initialMounted: true, transition: true });
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const [playersModalOpen, setPlayersModalOpen] = useState(false);
  const [onConfirm, onCancel, isOpen, openDeleteModal] = usePromiseModalWithReturn<DeletePlayerReturn>();

  useEffect(() => {
    setIdx(1);
    if (ref.current === document.activeElement) {
      focusOnFirst();
    }
  }, [ref, focusOnFirst]);

  // Register keys handler
  useEffect(() => {
    const arrowHandling = (event: JSX.TargetedKeyboardEvent<any>) => {
      if (isModalOpen()) {
        return;
      }

      switch (event.code) {
      case 'ArrowLeft':
        dispatch(selectPrevRound());
        toggleMenu(false);
        break;
      case 'ArrowRight':
        dispatch(selectNextRound());
        toggleMenu(false);
        break;
      case 'ArrowUp':
        focusOnPrev() && event.preventDefault();
        break;
      case 'ArrowDown':
        focusOnNext() && event.preventDefault();
        break;
      default:
        break;
      }
    };

    document.addEventListener('keydown', arrowHandling);
    return () => document.removeEventListener('keydown', arrowHandling);
  }, [dispatch, focusOnNext, focusOnPrev, ref, toggleMenu]);

  if (!players) {
    return null;
  }

  const selectRow = (playerId: number) => setIdx(playerId);
  const editPlayer = () => setPlayersModalOpen(true);
  const addPlayer = () => {
    // For adding players, let's find the nearest free id
    setIdx(findFreeId(players.orderById));
    setPlayersModalOpen(true);
  };
  const deletePlayer = () => checkAndDeletePlayer(idx, openDeleteModal);

  const handleContextMenu = (e: JSX.TargetedMouseEvent<HTMLElement>) => {
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    toggleMenu(true);
  };

  return (
    <div class={`table-container ${style.table}`} >
      <PlayersContextMenu menuState={menuState} toggleMenu={toggleMenu}
                          anchorPoint={anchorPoint} boundingBoxRef={scrollParent}
                          actions={{
                            editPlayer,
                            addPlayer,
                            deletePlayer,
                            sortList: () => {/**/},
                          }} />
      <PlayersTable players={players} idx={idx}
                  selectedRef={setRef} onContextMenu={handleContextMenu}
                  onRowSelect={selectRow} onRowEnter={editPlayer}
      />
      <Modal
        isOpen={playersModalOpen}
        onRequestClose={() => setPlayersModalOpen(false)}
        contentLabel="Edit player modal"
      >
        <PlayerDetails
          playerId={idx}
          setIndex={setIdx}
          onClose={() => setPlayersModalOpen(false)} />
      </Modal>
      <Modal
        isOpen={isOpen}
        onRequestClose={onCancel}
        contentLabel="Delete player confirmation modal"
      >
        <DeletePlayerModal
          player={players.index[idx]}
          onCancel={onCancel}
          onConfirm={onConfirm} />
      </Modal>
    </div>
  );
};

export default PlayersView;