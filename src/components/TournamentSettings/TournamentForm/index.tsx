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
import { SubmitHandler } from 'react-hook-form';

import Field from '@/TournamentSettings/Field';
import Form from '@/TournamentSettings/Form';

export type IFormInputs = {
  tournamentName: string,
  city: string,
  federation: string,
  dateOfStart: string,
  dateOfEnd: string,
  tournamentType: string,
  chiefArbiter: string,
  rateOfPlay: string,
}

interface IProps {
  modifiedFn: (isModified: boolean) => void
}

const TournamentForm: FunctionalComponent<IProps> = ({ modifiedFn }) => {
  const onSubmit: SubmitHandler<IFormInputs> = (data) => console.log(data);

  return (
    <Form
      onSubmit={onSubmit}
      onDirtyChange={modifiedFn}
      defaultValues={{
        tournamentName: '',
        city: '',
        federation: '',
        dateOfStart: '',
        dateOfEnd: '',
        tournamentType: '',
        chiefArbiter: '',
        rateOfPlay: ''
      } as IFormInputs}
    >
      <Field name="tournamentName"
             label="Tournament name"
             options={{ required: 'Tournament name is required' }} />
      <Field name="city"
             label="City" />
      <Field name="federation"
             label="Federation" />
      <Field name="dateOfStart"
             label="Date of start"
             options={{ required: 'Date of start is required' }} />
      <Field name="dateOfEnd"
             label="Date of end" />
      <Field name="tournamentType"
             label="Tournament type"
             placeholder="E.g.: Swiss system, individual, round-robin" />
      <Field name="chiefArbiter"
             label="Chief arbiter" />
      <Field name="rateOfPlay"
             label="Rate of play"
             placeholder="Allotted times per moves/game" />
      <input value="Create" type="submit" class="button is-primary" />
    </Form>
  );
};

export default TournamentForm;
