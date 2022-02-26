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
import { toast } from 'react-toastify';
import { Route } from 'wouter-preact';

import CreateTournament from 'routes/create';
import Home from 'routes/home';
import NotFound from 'routes/notFound';
import Pairs from 'routes/pairs';

import { AnimatedSwitch, slide } from '@/Animation';
import Header from '@/Header';
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
        registration.installing!.addEventListener('statechange', () => {
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

const App: FunctionalComponent = () => {
  useEffect(() => listenToSwUpdates(), []);

  return (
    <div id="root">
      <Header />
      <AnimatedSwitch
        {...pageTransitions}
        runOnMount={true}
        mapStyles={(styles) => ({
          transform: `translateX(${styles.offset}%)`,
          opacity: styles.opacity,
        })}
        className="route-wrapper"
      >
        <Route path="/create" component={CreateTournament} />
        <Route path="/pairs" component={Pairs} />
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </AnimatedSwitch>
      <ToastHandler />
    </div>
  );
};

export default App;
