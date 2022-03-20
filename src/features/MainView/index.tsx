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
import { Outlet, useLocation } from 'react-router';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { useAppSelector } from 'hooks';
import { selectTournament } from 'reducers/tournamentReducer';
import { CSSFade, CSSFadeOnEntering } from 'utils/transitions';

import MainViewSideMenu from './MainViewSideMenu';
import style from './style.scss';

import NextRoundButton from '@/NextRoundButton';
import { SectionWithSideMenu } from '@/SideMenu';

const MainView: FunctionalComponent = () => {
  const tournament = useAppSelector(selectTournament);
  const { pathname } = useLocation();

  if (!tournament) {
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
          <TransitionGroup className={style.animatedContainer}>
            <CSSTransition key={pathname} classNames={CSSFade} timeout={700} onEntering={CSSFadeOnEntering}>
              <section>
                <Outlet />
              </section>
            </CSSTransition>
          </TransitionGroup>
        </SectionWithSideMenu>
        <MainViewSideMenu />
      </section>
    </article>
  );
};

export default MainView;
