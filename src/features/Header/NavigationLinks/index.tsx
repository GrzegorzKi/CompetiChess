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

import { faChevronLeft, faChevronRight, faHouse } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { FunctionalComponent, h } from 'preact';
import { useNavigate } from 'react-router-dom';

import { isInStandaloneMode } from 'utils/common';
import { routes } from 'utils/index';

const NavigationLinks: FunctionalComponent = () => {
  const navigate = useNavigate();

  if (!isInStandaloneMode()) {
    return null;
  }

  return (
    <>
      <a role="navigation" aria-label="Go back" class="navbar-item"
       onClick={() => history.back()}>
        <Icon icon={faChevronLeft} />
      </a>
      <a role="navigation" aria-label="Go forward" class="navbar-item"
     onClick={() => history.forward()}>
        <Icon icon={faChevronRight} />
      </a>
      <a role="navigation" aria-label="Go to home page" class="navbar-item" onClick={() => {
        if (history.length > 1) {
          history.go(-(history.length - 1));
        }
        navigate(routes[''].path, { replace: true });
      }}>
        <Icon icon={faHouse} />
      </a>
    </>
  );
};

export default NavigationLinks;
