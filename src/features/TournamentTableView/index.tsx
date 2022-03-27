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
import { Location, useLocation, useNavigate } from 'react-router-dom';

import TournamentTableContextMenu from 'features/TournamentTableView/TournamentTableContextMenu';
import { useAppDispatch } from 'hooks/index';
import useElementFocus from 'hooks/useElementFocus';
import usePrint from 'hooks/usePrint';
import {
  PlayersState,
  selectNextRound,
  selectPrevRound,
} from 'reducers/tournamentReducer';
import { isModalOpen } from 'utils/modalUtils';

import style from './style.scss';
import TournamentTable from './TournamentTable';

import Checkbox from '@/Checkbox';
import PlayerDetailsModal from '@/PlayerDetails';
import PrintButton from '@/PrintButton';

interface IProps {
  players: PlayersState;
}

function getLocStateIdxOrDefault(location: Location) {
  const state = location.state as any;
  if (state && 'selectedPlayer' in state && typeof state.selectedPlayer === 'number') {
    return state.selectedPlayer as number;
  }
  return 1;
}

const TournamentTableView: FunctionalComponent<IProps> = ({ players }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [idx, setIdx] = useState(() => getLocStateIdxOrDefault(location));
  const [exactPlaces, setExactPlaces] = useState(false);

  const [ref, setRef, focusOnNext, focusOnPrev, , scrollParent] = useElementFocus<HTMLTableRowElement>({});

  const [menuState, toggleMenu] = useMenuState({ initialMounted: true, transition: true });
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

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
  const showPlayer = () => navigate(location.pathname, { state: { selectedPlayer: idx } });

  const handleContextMenu = (e: JSX.TargetedMouseEvent<HTMLElement>) => {
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    toggleMenu(true);
  };

  return (
    <>
      <div class="controls">
        <PrintButton handlePrint={handlePrint} />
        <button className="button is-outlined" disabled={idx > players.orderById.length} onClick={showPlayer}>Show player details</button>
        <Checkbox checked={exactPlaces} setChecked={setExactPlaces}>
          Show exact places
        </Checkbox>
      </div>
      <div class={`table-container ${style.table}`} >
        <TournamentTableContextMenu
          menuState={menuState} toggleMenu={toggleMenu}
          anchorPoint={anchorPoint} boundingBoxRef={scrollParent}
          actions={{ showPlayer }} />
        <TournamentTable tableRef={componentRef}
                         exactPlaces={exactPlaces}
                         players={players} idx={idx}
                         selectedRef={setRef} onContextMenu={handleContextMenu}
                         onRowSelect={selectRow} onRowEnter={showPlayer}
        />
        <PlayerDetailsModal
          playerId={idx}
          setIndex={setIdx}
          readonly
        />
      </div>
    </>
  );
};

export default TournamentTableView;
