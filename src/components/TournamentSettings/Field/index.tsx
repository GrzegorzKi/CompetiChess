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

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { h } from 'preact';
import { FieldError, Path, RegisterOptions, UseFormRegister } from 'react-hook-form';

export interface IFieldProps<T extends Record<string, unknown> = Record<string, unknown>> {
  name: keyof T;
  label: string;
  placeholder?: string;
  register?: UseFormRegister<T>;
  options?: RegisterOptions<T>;
  errors?: FieldError;
}

function Field<T extends Record<string, unknown>>({ name, label, placeholder, register, options, errors }: IFieldProps<T>): JSX.Element | null {
  if (!register) return null;

  return <div class="field">
    <label>
      <span class="label is-small">{label}</span>
      <div class="control has-icons-right">
        <input {...register(name as Path<T>, options)}
               class={`input is-small${errors ? ' is-danger' : ''}`}
               placeholder={placeholder ?? label}
               aria-invalid={errors ? true : undefined}
        />
        {errors && <span class="icon is-right has-text-danger">
          <Icon icon={faExclamationTriangle} />
        </span>}
      </div>
    </label>
    {errors && <p class="help is-danger">{errors?.message}</p>}
  </div>;
}

export default Field;
