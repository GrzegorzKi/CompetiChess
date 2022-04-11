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
import { Trans } from 'react-i18next';
import { toast } from 'react-toastify';


export function listenToSwUpdates(): void {
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
            toast.info((<p>
              <Trans i18nKey="Update is ready">
                <strong>Application update is ready!</strong><br />Ready to reload the app?
              </Trans>
            </p>), {
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
