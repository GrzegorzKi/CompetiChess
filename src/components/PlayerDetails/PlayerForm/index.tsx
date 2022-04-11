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
import { useTranslation } from 'react-i18next';

import { useAppSelector } from 'hooks/index';
import { selectConfiguration, selectPairs } from 'reducers/tournamentReducer';

import style from './style.scss';

import { Player, Sex } from '#/types/Tournament';
import Field, { RoundCheckboxes, Select } from '@/Field';
import Form from '@/Form';

export interface PlayerData extends Omit<Player, 'notPlayed'> {
  notPlayed: string[];
}

function range(to: number) {
  const values: number[] = [];
  for (let i = 1; i <= to; i++) {
    values.push(i);
  }
  return values;
}

interface IProps {
  defaultValues: PlayerData;
  values?: PlayerData;
  inputRef?: MutableRef<UseFormReturn<PlayerData> | undefined>;
  readonly?: boolean;
}

const PlayerForm: FunctionalComponent<IProps> = ({ defaultValues, values, inputRef, readonly }) => {
  const { t } = useTranslation();

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
          values={values}
          disabled={readonly}
    >
      {({ register, formState: { errors } }) => (<>
        <div class="field field-body is-horizontal">
          <Field label={t('No.')}
                 className={style.no}
                 {...register('id', { required: t('Required', { field: t('Id') }) })}
                 errors={errors.id}
                 disabled />
          <Field label={t('Player name')}
                 {...register('name', { required: t('Required', { field: t('Player name') }) })}
                 errors={errors.name} />
          <Select label={t('Sex')}
                  className={style.sex}
                  {...register('sex', { required: t('Required', { field: t('Sex') }) })}
                  errors={errors.sex}>
            <option value={Sex.MALE}>{t('Male')}</option>
            <option value={Sex.FEMALE}>{t('Female')}</option>
          </Select>
        </div>
        <div class="field field-body is-horizontal">
          <Field label={t('Rating')}
                 {...register('rating', { valueAsNumber: true })} />
          <Field label={t('FIDE Number')}
                 {...register('fideNumber')} />
        </div>
        <Field label={t('Federation')}
               {...register('federation')} />
        {/* TODO: Convert to date select field */}
        <Field label={t('Birth date')}
               {...register('birthDate')} />
        <div className="field field-body is-horizontal">
          <Field label={t('Late')}
                 {...register('late', { valueAsNumber: true })} />
          <Field label={t('Withdrawn')}
                 {...register('withdrawn', { valueAsNumber: true })} />
        </div>
        <RoundCheckboxes
          label={t('Not played rounds')}
          values={rounds}
          lockedTo={pairs.length}
          {...register('notPlayed')} />
      </>)}
    </Form>
  );
};

export default PlayerForm;
