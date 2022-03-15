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
import { useEffect, useState } from 'preact/hooks';

import { useAppDispatch, useAppSelector } from 'hooks';
import useElementFocus from 'hooks/useElementFocus';
import {
  selectNextRound,
  selectPrevRound,
  selectRound,
  selectViewOptions,
  setResult,
} from 'reducers/tournamentReducer';

import { Pair, PlayersRecord } from '#/types/Tournament';

import PaginateRound from '@/PaginateRound';
import PairContextMenu from '@/PairsView/PairContextMenu';
import PairsTable from '@/PairsView/PairsTable';

interface IProps {
  roundPairs: Array<Pair[]>;
  players: PlayersRecord;
}

const PairsView: FunctionalComponent<IProps> = ({ roundPairs, players }) => {
  const { selectedRound: round } = useAppSelector(selectViewOptions);
  const dispatch = useAppDispatch();

  const [idx, setIdx] = useState(0);
  const [ref, setRef, focusOnNext, focusOnPrev, focusOnFirst, scrollParent] = useElementFocus<HTMLTableRowElement>({});

  const [menuState, toggleMenu] = useMenuState({ initialMounted: true, transition: true });
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const pairs: Pair[] = roundPairs[round];

  useEffect(() => {
    setIdx(1);
    if (ref.current === document.activeElement) {
      focusOnFirst();
    }
  }, [round, ref, focusOnFirst]);

  // Register keys handler
  useEffect(() => {
    const arrowHandling = (event: JSX.TargetedKeyboardEvent<any>) => {
      const pairNo: string | undefined = ref.current?.dataset['index'];

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

  const selectRow = (pairNo: number) => {
    setIdx(pairNo);
  };

  const enterRow = (pairNo: number) => {
    alert(`Selected pair no ${pairNo}`);
  };

  const handleContextMenu = (e: JSX.TargetedMouseEvent<HTMLElement>) => {
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    toggleMenu(true);
  };

  return (
    <>
      <PaginateRound pageCount={roundPairs.length}
                     page={round}
                     onPageChange={({ selected }) => dispatch(selectRound(selected))} />
      <div class='table-container'>
        <PairContextMenu menuState={menuState} toggleMenu={toggleMenu}
                         anchorPoint={anchorPoint} boundingBoxRef={scrollParent}
                         actions={{
                           setScore: (result) => {
                             const pairNo = ref.current?.dataset['index'];
                             pairNo && dispatch(setResult({ pairNo, type: result }));
                           },
                           editResult: () => {/**/},
                           editPairing: () => {/**/},
                         }} />
        <PairsTable pairs={pairs} players={players} idx={idx}
                    selectedRef={setRef} onContextMenu={handleContextMenu}
                    onRowEnter={enterRow} onRowSelect={selectRow}
        />
      </div>
    </>
  );
};

export default PairsView;
