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

import './styles/global.scss';
import { h } from 'preact';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';

import App from '@/app';
import initStore from '@/store';

import './i18n/config';

const { store } = initStore();

const Main = (props: { url: string }): JSX.Element => {
  return typeof window === 'undefined'
    ? (
      <StaticRouter location={props.url}>
        <Provider store={store}>
          <App />
        </Provider>
      </StaticRouter>
    )
    : (
      <BrowserRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </BrowserRouter>
    );
};

export default Main;
