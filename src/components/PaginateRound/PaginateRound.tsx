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

import { FunctionalComponent, h, JSX } from 'preact';
import { useEffect } from 'preact/hooks';
import { useTranslation } from 'react-i18next';
import ReactPaginate from 'react-paginate';

import { useAppDispatch } from 'hooks/index';
import { selectNextRound, selectPrevRound } from 'reducers/tournamentReducer';
import { isModalOpen } from 'utils/modalUtils';

import styles from './style.scss';

export type PageChangeHandler = (selectedItem: { selected: number }) => void;

interface Props {
  pageCount: number,
  page: number,
  onPageChange: PageChangeHandler
}

const PaginateRound: FunctionalComponent<Props> = ({ pageCount, page, onPageChange }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Register keys handler
  useEffect(() => {
    const arrowHandling = (event: JSX.TargetedKeyboardEvent<any>) => {
      if (isModalOpen()) {
        return;
      }

      switch (event.code) {
      case 'ArrowLeft':
        dispatch(selectPrevRound());
        break;
      case 'ArrowRight':
        dispatch(selectNextRound());
        break;
      }
    };

    document.addEventListener('keydown', arrowHandling);
    return () => document.removeEventListener('keydown', arrowHandling);
  }, [dispatch]);

  if (pageCount <= 0) {
    return null;
  }

  return <nav class="pagination">
    <ReactPaginate
      pageCount={pageCount}
      forcePage={page}
      onPageChange={onPageChange}

      previousLabel={t('PreviousR')}
      nextLabel={t('NextR')}
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
