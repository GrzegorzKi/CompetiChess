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
import { ComponentChildren, Fragment, h } from 'preact';
import { forwardRef } from 'preact/compat';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import style from './style.scss';

export const ErrorIcon = ({ errors }: { errors?: FieldError }): JSX.Element | null => {
  return errors ? (
    <span class={`icon ${style.isSmallTablet} is-right has-text-danger`}>
      <Icon icon={faExclamationTriangle} />
    </span>
  ) : null;
};

export const ErrorLabel = ({ errors }: { errors?: FieldError }): JSX.Element | null => {
  return errors ? (<p class="help is-danger">{errors.message}</p>) : null;
};

export interface IFieldProps extends UseFormRegisterReturn {
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  errors?: FieldError;
  children?: ComponentChildren;
  disabled?: boolean;
  className?: string;
}

const Field = forwardRef<HTMLInputElement, IFieldProps>(({ label, placeholder, className, errors, children, ...register }, ref) => {
  return <div class={`field ${className ? className : ''}`}>
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
    <ErrorLabel errors={errors} />
    {children}
  </div>;
});

export interface ISelectProps extends UseFormRegisterReturn {
  label: string;
  errors?: FieldError;
  children?: ComponentChildren;
  disabled?: boolean;
  className?: string;
}

export const Select = forwardRef<HTMLSelectElement, ISelectProps>(({ label, className, errors, children, ...register }, ref) => {
  return <div class={`field ${className ? className : ''}`}>
    <label>
      <span class={`label ${style.isSmallTablet}`}>{label}</span>
      <div class={`control has-icons-right select is-fullwidth ${style.isSmallTablet}`}>
        <select {...register} ref={ref}
                class={errors ? 'is-danger' : ''}
                aria-invalid={errors ? true : undefined}>
          {children}
        </select>
        <ErrorIcon errors={errors} />
      </div>
    </label>
    <ErrorLabel errors={errors} />
  </div>;
});

export interface ICheckboxesProps extends UseFormRegisterReturn {
  label: string;
  values: number[],
  children?: ComponentChildren;
  disabled?: boolean;
}

export const RoundCheckboxes = forwardRef<HTMLInputElement, ICheckboxesProps>(({ label, values, children, ...register }, ref) => {
  return <div class={`field ${style.scrollable}`}>
    <span class={`label ${style.isSmallTablet}`}>{label}</span>
    {values.map((value) =>
      <Fragment key={value}>
        <input id={`notPlayed.${value}`}
               {...register} ref={ref}
               value={value}
               // disabled={value <= lockedTo}
               type="checkbox" className={`is-hidden ${style.buttonCheckbox}`}
        />
        <label htmlFor={`notPlayed.${value}`}
               className={`button ${style.isSmallTablet}`}>
          {value}
        </label>
      </Fragment>
    )}
    {children}
  </div>;
});

export default Field;
