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

import { MenuItem, ControlledMenu, MenuState, MenuDivider } from '@szhsin/react-menu';
import { ComponentProps, FunctionalComponent, h } from 'preact';

interface IProps {
  menuState: { state?: MenuState, endTransition: () => void };
  toggleMenu: (open?: boolean) => void;
  anchorPoint: { x: number, y: number };
  boundingBoxRef?: ComponentProps<typeof ControlledMenu>['boundingBoxRef'];
  actions: {
    editPlayer: () => void,
    addPlayer: () => void,
    deletePlayer: () => void,
    sortList: () => void,
  };
}

const PlayersContextMenu: FunctionalComponent<IProps> = (
  { menuState, toggleMenu, anchorPoint, boundingBoxRef, actions: { editPlayer, addPlayer, deletePlayer, sortList } }) => {

  return (
    <ControlledMenu {...menuState} anchorPoint={anchorPoint} boundingBoxRef={boundingBoxRef}
                    onClose={() => toggleMenu(false)}>
      <MenuItem onClick={editPlayer}>Edit player</MenuItem>
      <MenuItem onClick={addPlayer}>Add player</MenuItem>
      <MenuItem onClick={deletePlayer}>Delete player</MenuItem>
      <MenuDivider />
      <MenuItem onClick={sortList}>Sort...</MenuItem>
    </ControlledMenu>
  );
};

export default PlayersContextMenu;
