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
import { useRoute, Route, useLocation, Switch } from 'wouter-preact';

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
  runOnMount: boolean
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
      willLeave={() => ensureSpring(atLeave)}
      didLeave={didLeave}
    >
      {(interpolatedStyles) => (
        <div className={className}>
          {interpolatedStyles.map((config) => {
            const props = {
              style: mapStyles?.(config.style) ?? config.style,
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

export interface AnimatedRouteProps extends Omit<ITransitionProps, 'children'> {
  path: string,
  component: React.ComponentProps<typeof Route>['component'],
}

export function AnimatedRoute({
  component,
  path,
  ...routeTransitionProps
}: AnimatedRouteProps) {
  const [match] = useRoute(path);
  return (
    <Transition {...routeTransitionProps}>
      <Route
        key={match ? 'match' : 'no-match'}
        path={path}
        component={component}
      />
    </Transition>
  );
}

export interface AnimatedSwitchProps extends Omit<ITransitionProps, 'children'> {
  children: React.ComponentProps<typeof Switch>['children'],
}

export function AnimatedSwitch({
  children,
  ...routeTransitionProps
}: AnimatedSwitchProps) {
  const [location = ''] = useLocation();

  return (
    <Transition {...routeTransitionProps}>
      <Switch key={location} location={location}>
        {children}
      </Switch>
    </Transition>
  );
}

export { spring };
