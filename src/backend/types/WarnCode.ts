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

const enum WarnCode {
  ROUND_NUM,
  INITIAL_COLOR,
  HOLES_IN_IDS,
}

export function getMessageForWarnCode(code: WarnCode): string {
  switch (code) {
  case WarnCode.ROUND_NUM:
    return 'Number of rounds is not defined or invalid';
  case WarnCode.INITIAL_COLOR:
    return 'Initial color is not defined and it couldn\'t be inferred from loaded data';
  case WarnCode.HOLES_IN_IDS:
    return 'Provided file data has holes in players\' IDs. You may want to re-order them before the tournament starts.';
  }
}

export default WarnCode;
