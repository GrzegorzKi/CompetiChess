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
import { useEffect } from 'preact/hooks';
import Modal from 'react-modal';
import { Route, Routes, useLocation } from 'react-router';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Header from 'features/Header';
import Home from 'routes/home';
import NotFound from 'routes/notFound';
import Tournaments from 'routes/tournaments';
import CreateTournament from 'routes/tournaments-create';
import TournamentsSettings from 'routes/tournaments-settings';
import View from 'routes/view';
import constants, { locations, routes } from 'utils';
import { isInStandaloneMode } from 'utils/common';
import { listenToSwUpdates } from 'utils/swUtils';
import { CSSFade, CSSFadeOnEntered, CSSFadeOnEntering } from 'utils/transitions';

import NoScriptMessage from '@/NoScriptMessage';
import ToastHandler from '@/ToastHandler';


// We have to change page title in the main component instead of
// route components, since using animated route might not work well
// with two components existing simultaneously (i.e. when switching
// them back and forth)
function getTitle(location: string): string {
  const routeTitle = locations[location];
  if (routeTitle && routeTitle.title) {
    if (isInStandaloneMode()) {
      return routeTitle.title;
    }
    return `${routeTitle.title} | ${constants.appName}`;
  }
  return constants.appName;
}

const App: FunctionalComponent = () => {
  useEffect(() => {
    listenToSwUpdates();
    Modal.setAppElement('#root');
  }, []);

  const location = useLocation();
  useEffect(() => {
    document.title = getTitle(location.pathname);
  }, [location.pathname]);

  const route = locations[location.pathname];
  const locationForAnimation = route && route.parent
    ? route.parent
    : location.pathname;

  return (
    <div id="root">
      <Header />
      <NoScriptMessage />
      <TransitionGroup className="route-wrapper" appear>
        <CSSTransition key={locationForAnimation} classNames={CSSFade} timeout={1000}
                       onEntering={CSSFadeOnEntering} onEntered={CSSFadeOnEntered}>
          <main>
            <Routes location={location}>
              <Route path={routes.tournaments.path} element={<Tournaments />} />
              <Route path={routes.createTournament.path} element={<CreateTournament />} />
              <Route path={routes.tournamentSettings.path} element={<TournamentsSettings />} />
              <Route path={`${routes.view.path}/*`} element={<View />} />
              <Route path={routes[''].path} element={<Home />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </CSSTransition>
      </TransitionGroup>
      <ToastHandler />
    </div>
  );
};

export default App;
