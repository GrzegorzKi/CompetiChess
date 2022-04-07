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

/** Maps authored classNames to their CSS Modules -suffixed generated classNames. */
interface Mapping { [key: string]: string; }

declare module '*.css' { const mapping: Mapping; export default mapping; }
declare module '*.scss' { const mapping: Mapping; export default mapping; }
declare module '*.sass' { const mapping: Mapping; export default mapping; }
declare module '*.styl' { const mapping: Mapping; export default mapping; }
