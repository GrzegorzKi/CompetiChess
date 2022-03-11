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
import { useEffect } from 'preact/hooks';
import { DefaultValues, SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';

export type IFormProps<T extends Record<string, unknown>> = {
  onSubmit: SubmitHandler<T>;
  onDirtyChange?: (isDirty: boolean) => void;
  defaultValues?: DefaultValues<T>;
  children: (formMethods: UseFormReturn<T>) => ComponentChildren;
}

function Form<T extends Record<string, unknown>>(
  { children, defaultValues, onDirtyChange, onSubmit }: IFormProps<T>): JSX.Element {

  const formMethods = useForm<T>({
    mode: 'onTouched',
    defaultValues
  });
  const { handleSubmit, formState: { isDirty } } = formMethods;

  useEffect(() => {
    onDirtyChange && onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit) as unknown as JSX.EventHandler<JSX.TargetedEvent<HTMLFormElement>>}
          noValidate>
      {children(formMethods)}
    </form>
  );
}

export default Form;
