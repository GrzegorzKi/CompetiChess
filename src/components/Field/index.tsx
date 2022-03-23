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
import { ComponentChildren, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import style from './style.scss';

const ErrorIcon = ({ errors }: { errors?: FieldError }) => {
  return errors ? (
    <span class={`icon ${style.isSmallTablet} is-right has-text-danger`}>
      <Icon icon={faExclamationTriangle} />
    </span>
  ) : null;
};

export interface IFieldProps extends UseFormRegisterReturn {
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  errors?: FieldError;
  children?: ComponentChildren;
}

const Field = forwardRef<HTMLInputElement, IFieldProps>(({ label, placeholder, errors, children, ...register }, ref) => {
  return <div class="field">
    <label>
      <span class={`label ${style.isSmallTablet}`}>{label}</span>
      <div class="control has-icons-right">
        <input {...register} ref={ref}
               class={`input ${style.isSmallTablet}${errors ? ' is-danger' : ''}`}
               placeholder={placeholder ?? label}
               aria-invalid={errors ? true : undefined}
        />
        <ErrorIcon errors={errors} />
      </div>
    </label>
    {errors && <p class="help is-danger">{errors?.message}</p>}
    {children}
  </div>;
});

export default Field;
