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
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Field from '@/Field';
import Form from '@/Form';

export type IGeneralFormInputs = {
  createdDate: number,
  tournamentName: string,
  city: string,
  federation: string,
  dateOfStart: string,
  dateOfEnd: string,
  tournamentType: string,
  chiefArbiter: string,
  rateOfPlay: string,
  numberOfRounds: number,
}

interface IProps {
  inputRef?: MutableRef<UseFormReturn<IGeneralFormInputs> | undefined>;
  defaultValues?: Partial<IGeneralFormInputs>;
  visible?: boolean;
}

const TournamentForm: FunctionalComponent<IProps> = (
  { inputRef, defaultValues, visible }) => {
  const { t } = useTranslation();

  const onSubmit: SubmitHandler<IGeneralFormInputs> = () => {/**/};

  return (
    <Form onSubmit={onSubmit}
          inputRef={inputRef}
          defaultValues={defaultValues}
          visible={visible}>
      {({ register, formState: { errors } }) => (<>
        <Field label={t('Tournament name')}
               {...register('tournamentName', { required: t('Required', { field: t('Tournament name') }) })}
               errors={errors.tournamentName} />
        <div className="field field-body is-horizontal">
          <Field label={t('City')}
                 {...register('city')} />
          <Field label={t('Federation')}
                 {...register('federation')} />
        </div>
        <div className="field field-body is-horizontal">
          <Field label={t('Date of start')}
                 {...register('dateOfStart', { required: t('Required', { field: t('Date of start') }) })}
                 errors={errors.dateOfStart} />
          <Field label={t('Date of end')}
                 {...register('dateOfEnd')} />
        </div>
        <Field label={t('Tournament type')}
               placeholder="E.g.: Swiss system, individual, round-robin"
               {...register('tournamentType')} />
        <Field label={t('Chief arbiter')}
               {...register('chiefArbiter')} />
        <Field label={t('Rate of play')}
               placeholder={t('Rate of play placeholder')}
               {...register('rateOfPlay')} />
        <Field label={t('Number of rounds')} type="number"
               {...register('numberOfRounds', {
                 valueAsNumber: true,
                 required: t('Required', { field: t('Number of rounds') }),
                 min: {
                   value: 1,
                   message: t('Number of rounds too low')
                 },
                 max: {
                   value: 99,
                   message: t('Number of rounds above 99')
                 },
               })}
               errors={errors.numberOfRounds} />
      </>)}
    </Form>
  );
};

export default TournamentForm;
