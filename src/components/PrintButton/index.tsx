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

import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { h } from 'preact';

import style from './style.scss';


interface IProps {
  handlePrint: () => void;
}

const PrintButton = ({ handlePrint }: IProps): JSX.Element => {
  return (
    <button class={`button is-info icon-text ${style.nowrap}`} onClick={handlePrint}>
      <span class="icon"><Icon icon={faPrint} /></span>
      <span>Print</span>
    </button>
  );
};

export default PrintButton;
