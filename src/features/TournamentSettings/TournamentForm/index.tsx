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

  const onSubmit: SubmitHandler<IGeneralFormInputs> = (data) => console.log(data);

  return (
    <Form onSubmit={onSubmit}
          inputRef={inputRef}
          defaultValues={defaultValues}
          visible={visible}>
      {({ register, formState: { errors } }) => (<>
        <Field label="Tournament name"
               {...register('tournamentName', { required: 'Tournament name is required' })}
               errors={errors.tournamentName} />
        <div className="field field-body is-horizontal">
          <Field label="City"
                 {...register('city')} />
          <Field label="Federation"
                 {...register('federation')} />
        </div>
        <div className="field field-body is-horizontal">
          <Field label="Date of start"
                 {...register('dateOfStart', { required: 'Date of start is required' })}
                 errors={errors.dateOfStart} />
          <Field label="Date of end"
                 {...register('dateOfEnd')} />
        </div>
        <Field label="Tournament type"
               placeholder="E.g.: Swiss system, individual, round-robin"
               {...register('tournamentType')} />
        <Field label="Chief arbiter"
               {...register('chiefArbiter')} />
        <Field label="Rate of play"
               placeholder="Allotted times per moves/game"
               {...register('rateOfPlay')} />
        <Field label="Number of rounds" type="number"
               {...register('numberOfRounds', {
                 valueAsNumber: true,
                 required: 'Number of rounds is required',
                 min: {
                   value: 1,
                   message: 'Number of rounds must be positive'
                 },
                 max: {
                   value: 99,
                   message: 'Number of rounds cannot exceed 99 rounds'
                 },
               })}
               errors={errors.numberOfRounds} />
      </>)}
    </Form>
  );
};

export default TournamentForm;
