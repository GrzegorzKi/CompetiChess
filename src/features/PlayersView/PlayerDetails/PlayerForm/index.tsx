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

import { FunctionalComponent, h } from 'preact';
import { MutableRef } from 'preact/hooks';
import { UseFormReturn } from 'react-hook-form';

import { useAppSelector } from 'hooks/index';
import { selectConfiguration, selectPairs } from 'reducers/tournamentReducer';

import style from './style.scss';

import { Player, Sex } from '#/types/Tournament';
import Field, { RoundCheckboxes, Select } from '@/Field';
import Form from '@/Form';

export interface PlayerData extends Omit<Player, 'notPlayed'> {
  notPlayed: string[];
}

interface IProps {
  defaultValues: PlayerData;
  values?: PlayerData;
  inputRef?: MutableRef<UseFormReturn<PlayerData> | undefined>;
}

function range(to: number) {
  const values: number[] = [];
  for (let i = 1; i <= to; i++) {
    values.push(i);
  }
  return values;
}

const PlayerForm: FunctionalComponent<IProps> = ({ defaultValues, values, inputRef }) => {
  const configuration = useAppSelector(selectConfiguration);
  const pairs = useAppSelector(selectPairs);

  if (!configuration || !pairs) {
    return null;
  }

  const rounds = range(configuration.expectedRounds)
    .map((_, index) => index + 1);

  return (
    <Form onSubmit={() => {/**/}}
          inputRef={inputRef}
          defaultValues={defaultValues}
          values={values}>
      {({ register, formState: { errors } }) => (<>
        <div class="field field-body is-horizontal">
          <Field label="No."
                 className={style.no}
                 {...register('id', { required: 'This field is required' })}
                 errors={errors.id}
                 disabled />
          <Field label="Player name"
                 {...register('name', { required: 'Player name is required' })}
                 errors={errors.name} />
          <Select label="Sex"
                  className={style.sex}
                  {...register('sex', { required: 'Player sex is required' })}
                  errors={errors.sex}>
            <option value={Sex.MALE}>Male</option>
            <option value={Sex.FEMALE}>Female</option>
          </Select>
        </div>
        <div class="field field-body is-horizontal">
          <Field label="Rating"
                 {...register('rating')} />
          <Field label="FIDE Number"
                 {...register('fideNumber')} />
        </div>
        <Field label="Federation"
               {...register('federation')} />
        {/* TODO: Convert to date select field */}
        <Field label="Birth date"
               {...register('birthDate')} />
        <div className="field field-body is-horizontal">
          <Field label="Late - from round"
                 {...register('late', { valueAsNumber: true })} />
          <Field label="Withdrawn at round"
                 {...register('withdrawn', { valueAsNumber: true })} />
        </div>
        <RoundCheckboxes
          label="Not played rounds"
          values={rounds}
          {...register('notPlayed')} />
      </>)}
    </Form>
  );
};

export default PlayerForm;
