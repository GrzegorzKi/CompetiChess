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
import { Outlet, useLocation, useNavigate } from 'react-router';

import { useAppSelector } from 'hooks';
import { selectTournament } from 'reducers/tournamentReducer';
import { routes } from 'utils';

import style from './style.scss';

import MainViewSideMenu from '@/MainViewSideMenu';
import NextRoundButton from '@/NextRoundButton';
import { SectionWithSideMenu } from '@/SideMenu';

const View: FunctionalComponent = () => {
  const tournament = useAppSelector(selectTournament);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (!tournament) {
    if (pathname.startsWith(routes.view.path)) {
      navigate(routes[''].path);
    }
    return null;
  }

  return (
    <article class={`panel is-primary ${style.panel}`}>
      <p class="panel-heading">
        {tournament.tournamentName}
      </p>
      <section>
        <SectionWithSideMenu className={style.container}>
          <div class={style.commonControls}>
            <NextRoundButton><strong>Start next round</strong></NextRoundButton>
          </div>
          <Outlet />
        </SectionWithSideMenu>
        <MainViewSideMenu />
      </section>
    </article>
  );
};

export default View;
