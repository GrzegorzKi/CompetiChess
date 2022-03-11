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

import { cloneElement, h, JSX, VNode } from 'preact';
import { useEffect } from 'preact/hooks';
import { DefaultValues, SubmitHandler, useForm } from 'react-hook-form';

import Field, { IFieldProps } from '@/TournamentSettings/Field';

export type IFormProps<T extends Record<string, unknown>> = {
  onSubmit: SubmitHandler<T>;
  onDirtyChange?: (isDirty: boolean) => void;
  defaultValues?: DefaultValues<T>;
  children: VNode<IFieldProps<T> | unknown>[];
}

function isChildAField(child?: VNode<any>): child is VNode<typeof Field> {
  return child !== undefined && 'name' in child.props;
}

function Form<T extends Record<string, unknown>>(
  { children, defaultValues, onDirtyChange, onSubmit }: IFormProps<T>): JSX.Element {

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<T>({
    mode: 'onTouched',
    defaultValues
  });

  useEffect(() => {
    onDirtyChange && onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const aChildren = Array.isArray(children) ? children : [children];

  return (
    <form onSubmit={handleSubmit(onSubmit) as unknown as JSX.EventHandler<JSX.TargetedEvent<HTMLFormElement>>}>
      {aChildren.map(child => {
        return isChildAField(child)
          ? cloneElement<typeof Field>(child, {
            ...child.props,
            key: child.props.name,
            register,
            errors: errors[child.props.name],
          }
          ) : child;
      })}
    </form>
  );
}

export default Form;
