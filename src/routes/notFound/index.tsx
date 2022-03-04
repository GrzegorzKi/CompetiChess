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

import { h } from 'preact';
import { useEffect } from 'preact/hooks';

import constants from '../../constants';

export default function NotFound(): JSX.Element {
  useEffect(() => {
    document.title = `404 Not Found | ${constants.APP_NAME}`;
  }, []);

  // Preact's pre-render works in Node environment,
  // so we check if window object is defined
  const currentPage = typeof window !== 'undefined'
    ? <p class="is-size-7 mt-3">Current page: <a href={window.location.href} >{window.location.href}</a></p>
    : null;

  return (
    <section>
      <p>This page has not been found! <a class="has-text-link" onClick={() => window.history.back()}>Do you want to go back?</a></p>
      {currentPage}
    </section>
  );
}
