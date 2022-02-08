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

import { FunctionalComponent, h } from 'preact';
import ReactPaginate from 'react-paginate';

import styles from './style.scss';

export type PageChangeHandler = (selectedItem: { selected: number }) => void;

interface Props {
  pageCount: number,
  page: number,
  onPageChange: PageChangeHandler
}

const PaginateRound: FunctionalComponent<Props> = ({ pageCount, page, onPageChange }) => {
  return <ReactPaginate
    pageCount={pageCount}
    forcePage={page}
    onPageChange={onPageChange}

    previousLabel="Previous"
    nextLabel="Next"
    breakLabel="..."

    containerClassName={styles.paginationContainer}
    disabledClassName={styles.disabled}
    activeClassName={styles.active}
    previousClassName={styles.previous}
    nextClassName={styles.next}

    ariaLabelBuilder={index => `Round ${index}`}
    previousAriaLabel="Previous round"
    nextAriaLabel="Next round"
  />;
};

export default PaginateRound;
