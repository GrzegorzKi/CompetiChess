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
import { useLocation } from 'react-router';
import { Navigate, NavigateProps } from 'react-router-dom';

interface IProps extends NavigateProps {
  from: string;
}

const SoftNavigate: FunctionalComponent<IProps> = ({ from, ...navigate }) => {
  const { pathname } = useLocation();
  const path = pathname[pathname.length - 1] === '/'
    ? pathname.substring(0, pathname.length - 1)
    : pathname;

  if (path !== from) {
    return null;
  }

  return <Navigate {...navigate} />;
};

export default SoftNavigate;
