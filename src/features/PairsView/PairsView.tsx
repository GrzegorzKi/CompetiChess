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
import { h, FunctionalComponent, JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import PairContextMenu from 'features/PairsView/PairContextMenu';
import PairResultsModal from 'features/PairsView/PairResults';
import PairsTable from 'features/PairsView/PairsTable';
import { useAppDispatch, useAppSelector } from 'hooks/index';
import useElementFocus from 'hooks/useElementFocus';
import usePrint from 'hooks/usePrint';
import {
  selectNextRound,
  selectPrevRound,
  selectViewOptions,
  setResult,
} from 'reducers/tournamentReducer';
import { getDataIndex } from 'utils/common';
import { isModalOpen } from 'utils/modalUtils';

import style from './style.scss';

import { Pair, PlayersRecord } from '#/types/Tournament';
import PrintButton from '@/PrintButton';

interface IProps {
  roundPairs: Array<Pair[]>;
  players: PlayersRecord;
}

const PairsView: FunctionalComponent<IProps> = ({ roundPairs, players }) => {
  const { t } = useTranslation();

  const { selectedRound: round } = useAppSelector(selectViewOptions);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [ref, setRef, focusOnNext, focusOnPrev, focusOnFirst, scrollParent] = useElementFocus<HTMLTableRowElement>({ offset: { top: 42, bottom: 0 } });
  const [idx, setIdx] = useState(() => {
    const state = location.state as any;
    if (state && 'selectedPair' in state && typeof state.selectedPair === 'number') {
      return state.selectedPair;
    }
    return 1;
  });

  const [menuState, toggleMenu] = useMenuState({ initialMounted: true, transition: true });
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = usePrint({
    documentTitle: `${t('Pairings for round')} ${round + 1}`,
    componentRef,
  });

  const pairs: Pair[] = roundPairs[round];

  useEffect(() => {
    if (!isModalOpen()) {
      setIdx(1);
      if (ref.current === document.activeElement) {
        focusOnFirst();
      }
    }
  }, [round, ref, focusOnFirst]);

  // Register keys handler
  useEffect(() => {
    const arrowHandling = (event: JSX.TargetedKeyboardEvent<any>) => {
      if (isModalOpen()) {
        return;
      }
      const pairNo = getDataIndex(ref.current);

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
        switch (event.key) {
        case 'w':
        case 'W':
        case '1':
          pairNo && dispatch(setResult({ pairNo, type: 'WHITE_WIN' }));
          event.shiftKey ? focusOnPrev() : focusOnNext();
          break;
        case 'l':
        case 'L':
        case '0':
          pairNo && dispatch(setResult({ pairNo, type: 'BLACK_WIN' }));
          event.shiftKey ? focusOnPrev() : focusOnNext();
          break;
        case 'd':
        case 'D':
        case '5':
          pairNo && dispatch(setResult({ pairNo, type: 'DRAW' }));
          event.shiftKey ? focusOnPrev() : focusOnNext();
          break;
        }
      }
    };

    document.addEventListener('keydown', arrowHandling);
    return () => document.removeEventListener('keydown', arrowHandling);
  }, [dispatch, focusOnNext, focusOnPrev, ref, toggleMenu]);

  const selectRow = (pairNo: number) => setIdx(pairNo);
  const enterRow = () => {
    navigate(location.pathname, { state: { selectedPair: idx } });
  };

  const handleContextMenu = (e: JSX.TargetedMouseEvent<HTMLElement>) => {
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    toggleMenu(true);
  };

  return (
    <>
      <div class="controls">
        <PrintButton handlePrint={handlePrint} />
        <button class="button is-outlined" onClick={enterRow}>{t('Edit result')}</button>
      </div>
      <div class={`table-container ${style.table}`} >
        <PairContextMenu menuState={menuState} toggleMenu={toggleMenu}
                         anchorPoint={anchorPoint} boundingBoxRef={scrollParent}
                         actions={{
                           setScore: (result) => {
                             const pairNo = ref.current?.dataset['index'];
                             pairNo && dispatch(setResult({ pairNo: (+pairNo), type: result }));
                           },
                           editResult: enterRow,
                           editPairing: () => {/**/},
                         }} />
        <PairsTable tableRef={componentRef}
                    pairs={pairs} players={players} idx={idx}
                    selectedRef={setRef} onContextMenu={handleContextMenu}
                    onRowSelect={selectRow} onRowEnter={enterRow}
        />
        <PairResultsModal pairNo={idx} round={round}
                          setPairNo={setIdx}
        />
      </div>
    </>
  );
};

export default PairsView;
