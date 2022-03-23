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

const constants = {
  appName: 'CompetiChess'
};

type RouteType = {
  path: string;
  pathRel: string;
  title: string;
  parent?: string;
};

export const _routes = {
  tournaments: {
    path: '/tournaments/',
    title: 'Tournaments'
  },
  createTournament: {
    path: '/tournaments/create',
    title: 'Create tournament'
  },
  tournamentSettings: {
    path: '/tournaments/settings',
    title: 'Tournament settings'
  },
  view: {
    path: '/view',
    title: ''
  },
  pairs: {
    path: '/view/pairs',
    pathRel: 'pairs',
    title: 'Pairs',
    parent: '/view'
  },
  players: {
    path: '/view/players',
    pathRel: 'players',
    title: 'Players',
    parent: '/view'
  },
  tournamentTable: {
    path: '/view/tournamentTable',
    pathRel: 'tournamentTable',
    title: 'Tournament table',
    parent: '/view'
  },
  '': {
    path: '/',
    title: ''
  }
};

type Routes = {
  [P in keyof typeof _routes]: RouteType;
}

export const routes = _routes as Routes;

type LocationsType = {
  title: string;
  parent?: string;
}

export const locations = Object.entries(routes).reduce(((previous, [, value]) => {
  previous[value.path] = {
    title: value.title,
    parent: value.parent,
  };
  return previous;
}), {} as Partial<Record<string, LocationsType>>);

export default constants;
