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

import { ComponentChildren, h, JSX } from 'preact';
import { MutableRef, useEffect } from 'preact/hooks';
import { DefaultValues, SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';

export type IFormProps<T extends Record<string, unknown>> = {
  onSubmit: SubmitHandler<T>;
  defaultValues?: DefaultValues<T>;
  values?: DefaultValues<T>;
  children: (formMethods: UseFormReturn<T>) => ComponentChildren;
  inputRef?: MutableRef<UseFormReturn<T> | undefined>;
  visible?: boolean;
  disabled?: boolean;
}

function Form<T extends Record<string, any>>(
  { children, defaultValues, values, inputRef, onSubmit, visible, disabled }: IFormProps<T>): JSX.Element {

  const formMethods = useForm<T>({
    mode: 'onTouched',
    defaultValues
  });
  const { handleSubmit, reset } = formMethods;

  useEffect(() => {
    if (inputRef) {
      inputRef.current = formMethods;
    }
  }, [formMethods, inputRef]);

  useEffect(() => {
    values && reset(values);
  }, [reset, values]);

  return (
    <fieldset disabled={disabled}>
      <form style={visible === false ? 'display: none;' : ''}
            onSubmit={handleSubmit(onSubmit) as unknown as JSX.EventHandler<JSX.TargetedEvent<HTMLFormElement>>}
            noValidate>
        {children(formMethods)}
      </form>
    </fieldset>
  );
}

export default Form;
