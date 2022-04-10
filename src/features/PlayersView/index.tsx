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
import { useEffect, useRef, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import DeletePlayerModal, { DeletePlayerReturn } from 'features/PlayersView/DeletePlayerModal';
import PlayersTable from 'features/PlayersView/PlayersTable';
import { useAppDispatch } from 'hooks/index';
import useElementFocus from 'hooks/useElementFocus';
import usePrint from 'hooks/usePrint';
import usePromiseModal, { usePromiseModalWithReturn } from 'hooks/usePromiseModal';
import {
  deletePlayer as deletePlayerAction,
  PlayersState,
  selectNextRound,
  selectPrevRound,
  sortPlayers as sortPlayersAction,
} from 'reducers/tournamentReducer';
import { isModalOpen } from 'utils/modalUtils';

import PlayersContextMenu from './PlayersContextMenu';
import SortPlayersModal from './SortPlayersModal';
import style from './style.scss';

import LocationStateModal from '@/modals/LocationStateModal';
import PlayerDetailsModal from '@/PlayerDetails';
import PrintButton from '@/PrintButton';
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

async function checkAndSortPlayers(onSortGuard: () => Promise<boolean>) {
  const dispatch = store.dispatch;

  if (!await onSortGuard()) {
    return;
  }

  dispatch(sortPlayersAction());
}

interface IProps {
  players: PlayersState;
}

const PlayersView: FunctionalComponent<IProps> = ({ players }) => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [idx, setIdx] = useState(() => {
    const state = location.state as any;
    if (state && 'selectedPlayer' in state && typeof state.selectedPlayer === 'number') {
      return state.selectedPlayer as number;
    }
    return 1;
  });

  const [ref, setRef, focusOnNext, focusOnPrev, , scrollParent] = useElementFocus<HTMLTableRowElement>({});

  const [menuState, toggleMenu] = useMenuState({ initialMounted: true, transition: true });
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const [onConfirm, onCancel, isOpen, openDeleteModal] = usePromiseModalWithReturn<DeletePlayerReturn>('deleteModal');
  const [onSortConfirm, onSortCancel, isSortModalOpen, openSortModal] = usePromiseModal('sortModal');

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = usePrint({
    documentTitle: 'Players',
    componentRef,
  });

  // Register keys handler
  useEffect(() => {
    const arrowHandling = (event: JSX.TargetedKeyboardEvent<any>) => {
      if (isModalOpen()) {
        return;
      }

      switch (event.code) {
      case 'ArrowLeft':
        dispatch(selectPrevRound());
        break;
      case 'ArrowRight':
        dispatch(selectNextRound());
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
  const editPlayer = () => navigate(location.pathname, { state: { selectedPlayer: idx } });
  const addPlayer = () => {
    // For adding players, let's find the nearest free id
    setIdx(findFreeId(players.orderById));
    editPlayer();
  };
  const deletePlayer = () => checkAndDeletePlayer(idx, openDeleteModal);
  const sortPlayers = () => checkAndSortPlayers(openSortModal);

  const handleContextMenu = (e: JSX.TargetedMouseEvent<HTMLElement>) => {
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    toggleMenu(true);
  };

  return (
    <>
      <div class="controls">
        <PrintButton handlePrint={handlePrint} />
        <button class="button is-success" onClick={addPlayer}>{t('Add player')}</button>
        <button class="button is-outlined" disabled={players.index[idx] === undefined} onClick={editPlayer}>{t('Edit player')}</button>
        <button class="button is-danger is-outlined" disabled={players.index[idx] === undefined} onClick={deletePlayer}>{t('Delete player')}</button>
        <button class="button is-info is-outlined" onClick={sortPlayers}>{t('Sort')}</button>
      </div>
      <div class={`table-container ${style.table}`} >
        <PlayersContextMenu menuState={menuState} toggleMenu={toggleMenu}
                            anchorPoint={anchorPoint} boundingBoxRef={scrollParent}
                            actions={{
                              editPlayer,
                              addPlayer,
                              deletePlayer,
                              sortPlayers,
                            }} />
        <PlayersTable tableRef={componentRef}
                      players={players} idx={idx}
                      selectedRef={setRef} onContextMenu={handleContextMenu}
                      onRowSelect={selectRow} onRowEnter={editPlayer}
        />
        <PlayerDetailsModal
          playerId={idx}
          setIndex={setIdx}
        />
        <LocationStateModal
          stateKey="deleteModal"
          isActive={isOpen}
          onRequestClose={onCancel}
          contentLabel="Delete player confirmation modal"
        >
          <DeletePlayerModal
            player={players.index[idx]}
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        </LocationStateModal>
        <LocationStateModal
          stateKey="sortModal"
          isActive={isSortModalOpen}
          onRequestClose={onSortCancel}
          contentLabel="Sort players modal"
        >
          <SortPlayersModal
            onCancel={onSortCancel}
            onConfirm={onSortConfirm}
          />
        </LocationStateModal>
      </div>
    </>
  );
};

export default PlayersView;
