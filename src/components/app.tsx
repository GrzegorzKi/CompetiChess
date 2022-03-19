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
import { Route, useLocation } from 'react-router';
import { toast } from 'react-toastify';

import Home from 'routes/home';
import NotFound from 'routes/notFound';
import Pairs from 'routes/pairs';
import Tournaments from 'routes/tournaments';
import CreateTournament from 'routes/tournaments-create';
import constants, { locations, routes } from 'utils';

import { AnimatedRoutes, slide } from '@/Animation';
import Header from '@/Header';
import NoScriptMessage from '@/NoScriptMessage';
import ToastHandler from '@/ToastHandler';

const pageTransitions = {
  atEnter: {
    offset: -50,
    opacity: 0
  },
  atLeave: {
    offset: slide(-50),
    opacity: slide(0)
  },
  atActive: {
    offset: slide(0),
    opacity: slide(1)
  }
};

function listenToSwUpdates() {
  if ('serviceWorker' in navigator) {
    let refreshing = false;

    // This fires when the service worker controlling this page
    // changes, eg a new worker has skipped waiting and become
    // the new active worker.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });

    navigator.serviceWorker.ready.then(registration => {
      registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', () => {
          const waitingWorker = registration.waiting;
          if (waitingWorker !== null) {
            toast.info(<p><strong>Application update is ready!</strong><br /> Ready to reload the app?</p>, {
              autoClose: false,
              closeOnClick: false,
              draggable: false,
              onClick: () => {
                waitingWorker.postMessage('SKIP_WAITING');
              },
            });
          }
        });
      });
    });
  }
}

// We have to change page title in the main component instead of
// route components, since using animated route might not work well
// with two components existing simultaneously (i.e. when switching
// them back and forth)
function getTitle(location: string): string {
  const routeTitle = locations[location];
  return routeTitle
    ? `${routeTitle} | ${constants.appName}`
    : constants.appName;
}

const App: FunctionalComponent = () => {
  useEffect(() => {
    listenToSwUpdates();
    Modal.setAppElement('#root');
  }, []);

  const { pathname } = useLocation();
  useEffect(() => {
    document.title = getTitle(pathname);
  }, [pathname]);

  return (
    <div id="root">
      <Header />
      <NoScriptMessage />
      <AnimatedRoutes
        {...pageTransitions}
        runOnMount={true}
        mapStyles={(styles) => ({
          transform: `translateX(${styles.offset}%)`,
          opacity: styles.opacity,
        })}
        className="route-wrapper"
      >
        <Route path={routes.tournaments.path} element={<Tournaments />} />
        <Route path={routes.createTournament.path} element={<CreateTournament />} />
        <Route path={routes.manageTournament.path} element={null} />
        <Route path={routes.pairs.path} element={<Pairs />} />
        <Route path={routes[''].path} element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </AnimatedRoutes>
      <ToastHandler />
    </div>
  );
};

export default App;
