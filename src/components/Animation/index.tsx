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

import { cloneElement, h } from 'preact';
import { JSXInternal } from 'preact/src/jsx';
import {
  OpaqueConfig,
  PlainStyle,
  spring,
  Style,
  TransitionMotion,
  TransitionPlainStyle,
  TransitionStyle
} from 'react-motion';
import { Route, Routes, useLocation } from 'react-router-dom';

import { locations } from 'utils/index';

export function glide(val: number): OpaqueConfig {
  return spring(val, {
    stiffness: 174,
    damping: 10
  });
}

export function fastSlide(val: number): OpaqueConfig {
  return spring(val, {
    stiffness: 228,
    damping: 26
  });
}

export function slide(val: number): OpaqueConfig {
  return spring(val, {
    stiffness: 95,
    damping: 17
  });
}

export const defaultTransitions = {
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

function ensureSpring(styles: Style = {}): Style {
  const obj: Style = {};

  for (const key in styles) {
    const value = styles[key];
    if (typeof value === 'number') {
      obj[key] = spring(value);
    } else {
      obj[key] = value;
    }
  }

  return obj;
}

function addPointerEventsProp(styles: Style): Style {
  styles['pointer-events'] = 1;
  return styles;
}

type HTMLProps =
  | (JSXInternal.HTMLAttributes &
  JSXInternal.SVGAttributes &
  Record<string, any>)
  | null

interface ITransitionProps {
  children: JSX.Element,
  className: string,
  atActive: Style,
  atEnter: PlainStyle,
  atLeave: Style,
  didLeave?: ((styleThatLeft: TransitionStyle) => void),
  mapStyles?: (style: PlainStyle) => HTMLProps,
  runOnMount?: boolean,
  noPointerEventsOnLeave?: boolean,
  wrapperComponent?: string | false,
}

function Transition({
  children,
  className,
  atActive,
  atEnter,
  atLeave,
  didLeave,
  mapStyles,
  runOnMount = false,
  noPointerEventsOnLeave = true,
  wrapperComponent = 'div'
}: ITransitionProps) {
  const defaultStyles =
    !runOnMount
      ? undefined
      : children === undefined
        ? []
        : [
          {
            key: children.key,
            data: children,
            style: atEnter
          }
        ] as TransitionPlainStyle[];

  const styles =
    children === undefined
      ? []
      : [
        {
          key: children.key,
          data: children,
          style: ensureSpring(atActive)
        }
      ]  as TransitionStyle[];

  return (
    <TransitionMotion
      defaultStyles={defaultStyles}
      styles={styles}
      willEnter={() => atEnter}
      willLeave={() => addPointerEventsProp(ensureSpring(atLeave))}
      didLeave={didLeave}
    >
      {(interpolatedStyles) => (
        <div className={className}>
          {interpolatedStyles.map((config) => {
            const style = mapStyles?.(config.style) ?? config.style;
            if (noPointerEventsOnLeave && config.style['pointer-events'] !== undefined) {
              style['pointer-events'] = 'none';
            }

            const props = {
              style,
              key: config.key
            };

            return wrapperComponent !== false
              ? h(wrapperComponent, props, config.data)
              : cloneElement(config.data, props);
          })}
        </div>
      )}
    </TransitionMotion>
  );
}

export interface AnimatedRouteProps extends Omit<ITransitionProps, 'children'> {
  path: string,
  element?: React.ReactNode | null;
}

export const AnimatedRoute =({
  element,
  path,
  ...routeTransitionProps
}: AnimatedRouteProps) => {
  return (
    <Transition {...routeTransitionProps}>
      <Route
        key={path}
        path={path}
        element={element}
      />
    </Transition>
  );
};

export interface AnimatedRoutesProps extends Omit<ITransitionProps, 'children'> {
  children: React.ComponentProps<typeof Routes>['children'],
}

export const AnimatedRoutes = ({
  children,
  ...routeTransitionProps
}: AnimatedRoutesProps) => {
  const location = useLocation();
  const route = locations[location.pathname];

  const locationForAnimation = route && route.parent
    ? route.parent
    : location.pathname;

  return (
    <Transition {...routeTransitionProps}>
      <Routes key={locationForAnimation} location={location}>
        {children}
      </Routes>
    </Transition>
  );
};

export { spring };
