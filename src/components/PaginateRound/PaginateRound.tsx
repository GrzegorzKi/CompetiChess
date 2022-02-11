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
  if (pageCount <= 0) {
    return null;
  }

  return <nav class="pagination">
    <ReactPaginate
      pageCount={pageCount}
      forcePage={page}
      onPageChange={onPageChange}

      previousLabel="Previous"
      nextLabel="Next"
      breakLabel="..."

      containerClassName={`pagination-list ${styles.customOrdering}`}
      pageLinkClassName="pagination-link"
      activeLinkClassName="is-current"
      disabledLinkClassName="is-disabled"
      previousLinkClassName="pagination-previous"
      nextLinkClassName="pagination-next"
      breakLinkClassName="pagination-ellipsis"

      pageClassName=""
      activeClassName=""
      disabledClassName=""
      previousClassName=""
      nextClassName=""
      breakClassName=""

      ariaLabelBuilder={index => `Round ${index}`}
      previousAriaLabel="Previous round"
      nextAriaLabel="Next round"
    />
  </nav>;
};

export default PaginateRound;
