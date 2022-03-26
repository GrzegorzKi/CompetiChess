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
import { useEffect, useState } from 'preact/hooks';
import {  Route, Routes, useLocation } from 'react-router';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { useAppDispatch, useAppSelector } from 'hooks';
import {
  selectPairs,
  selectRound,
  selectTournament,
  selectViewOptions,
} from 'reducers/tournamentReducer';
import Pairs from 'routes/pairs';
import Players from 'routes/players';
import { locations, routes } from 'utils';
import { CSSFade, CSSFadeOnEntered, CSSFadeOnEntering } from 'utils/transitions';

import MainViewSideMenu from './MainViewSideMenu';
import style from './style.scss';

import DeleteRoundButton from '@/DeleteRoundButton';
import NextRoundButton from '@/NextRoundButton';
import PaginateRound from '@/PaginateRound';
import { SectionWithSideMenu } from '@/SideMenu';
import SoftNavigate from '@/SoftNavigate';

const MainView: FunctionalComponent = () => {
  const tournament = useAppSelector(selectTournament);
  const pairs = useAppSelector(selectPairs);
  const { selectedRound: round } = useAppSelector(selectViewOptions);
  const dispatch = useAppDispatch();

  const { pathname } = useLocation();
  const [locationKey, setLocationKey] = useState(pathname);

  useEffect(() => {
    const route = locations[pathname];
    setLocationKey(prev => route && route.parent
      ? pathname
      : prev);
  }, [pathname]);

  if (!tournament || !pairs) {
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
            <DeleteRoundButton><strong>Delete round</strong></DeleteRoundButton>
          </div>
          <div className={style.commonControls}>
            <PaginateRound pageCount={pairs.length}
                           page={round}
                           onPageChange={({ selected }) => dispatch(selectRound(selected))} />
          </div>
          <TransitionGroup className={style.animatedContainer}>
            <CSSTransition key={locationKey} classNames={CSSFade} timeout={700}
                           onEntering={CSSFadeOnEntering} onEntered={CSSFadeOnEntered}>
              <section>
                <Routes location={locationKey}>
                  <Route index element={<SoftNavigate from={routes.view.path} to={routes.pairs.path} replace />}  />
                  <Route path={routes.pairs.pathRel} element={<Pairs />} />
                  <Route path={routes.players.pathRel} element={<Players />} />
                  <Route path={routes.tournamentTable.pathRel} element={<Pairs />} />
                </Routes>
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
