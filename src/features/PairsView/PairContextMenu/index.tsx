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

import { MenuItem, ControlledMenu, MenuState, MenuGroup, MenuDivider } from '@szhsin/react-menu';
import { ComponentProps, FunctionalComponent, h } from 'preact';

import { ResultType } from '#/utils/ResultUtils';

interface IProps {
  menuState: { state?: MenuState, endTransition: () => void };
  toggleMenu: (open?: boolean) => void;
  anchorPoint: { x: number, y: number };
  boundingBoxRef?: ComponentProps<typeof ControlledMenu>['boundingBoxRef'];
  actions: {
    setScore: (result: ResultType) => void;
    editResult: () => void;
    editPairing: () => void;
  }
}

const PairContextMenu: FunctionalComponent<IProps> = (
  { menuState, toggleMenu, anchorPoint, boundingBoxRef, actions: { setScore, editResult, editPairing } }) => {

  return (
    <ControlledMenu {...menuState} anchorPoint={anchorPoint} boundingBoxRef={boundingBoxRef}
                    onClose={() => toggleMenu(false)}>
      <MenuGroup className="szh-menu__group_flex">
        <MenuItem onClick={() => setScore('WHITE_WIN')}>1 : 0</MenuItem>
        <MenuItem onClick={() => setScore('DRAW')}>= : =</MenuItem>
        <MenuItem onClick={() => setScore('BLACK_WIN')}>0 : 1</MenuItem>
      </MenuGroup>
      <MenuGroup className="szh-menu__group_flex">
        <MenuItem onClick={() => setScore('WHITE_FORFEIT_WIN')}>+ : -</MenuItem>
        <MenuItem onClick={() => setScore('BLACK_FORFEIT_WIN')}>- : +</MenuItem>
        <MenuItem onClick={() => setScore('FORFEIT')}>- : -</MenuItem>
      </MenuGroup>
      <MenuGroup className="szh-menu__group_flex">
        <MenuItem onClick={() => setScore('ZERO_ZERO')}>0 : 0</MenuItem>
        <MenuItem onClick={() => setScore('BLACK_HALF_POINT')}>0 : =</MenuItem>
        <MenuItem onClick={() => setScore('WHITE_HALF_POINT')}>= : 0</MenuItem>
      </MenuGroup>
      <MenuDivider />
      <MenuItem onClick={editResult}>Edit result</MenuItem>
      <MenuItem onClick={editPairing}>Edit pairing</MenuItem>
    </ControlledMenu>
  );
};

export default PairContextMenu;
