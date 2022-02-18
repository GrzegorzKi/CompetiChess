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

import { ComponentChildren, h } from 'preact';

import { useAppDispatch } from 'hooks';

import { createNextRound } from 'reducers/tournamentReducer';

interface Props {
  children: ComponentChildren;
}

const NextRoundButton = ({ children }: Props): JSX.Element => {
  
  const dispatch = useAppDispatch();

  return <button class="button is-primary trans-bg is-block mb-5" onClick={() => dispatch(createNextRound())}>
    {children}
  </button>;
};

export default NextRoundButton;
