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
import { FunctionalComponent, h } from 'preact';
import { MutableRef } from 'preact/hooks';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';

import { Color } from '#/types/Tournament';
import { Checkbox, Select } from '@/Field';
import style from '@/Field/style.scss';
import Form from '@/Form';

export type IMatchmakingFormInputs = {
  initialColor: Color;
  useBakuAcceleration: boolean;
};

interface IProps {
  inputRef?: MutableRef<UseFormReturn<IMatchmakingFormInputs> | undefined>;
  defaultValues?: IMatchmakingFormInputs;
  visible?: boolean;
  afterFirst: boolean;
}

const MatchmakingForm: FunctionalComponent<IProps> = (
  { inputRef, defaultValues, visible, afterFirst }) => {

  const onSubmit: SubmitHandler<IMatchmakingFormInputs> = () => {/**/};

  const bakuAccelerationLabel = (<>
    Use Baku Acceleration (
    <a href="https://handbook.fide.com/chapter/C0405"
       rel="noopener noreferrer" class="has-text-link">
      more info
    </a>)
  </>);

  return (
    <Form onSubmit={onSubmit}
          inputRef={inputRef}
          defaultValues={defaultValues}
          visible={visible}>
      {({ register, formState: { errors } }) => {
        return (<>
          <div class={`icon-text ${style.isSmallTablet} mb-2`}>
            <div class="icon"><Icon icon={faExclamationTriangle} /></div>
            <b>Warning:&nbsp;</b>Some settings might not be available after first pairing
          </div>
          <Select label="Initial color for first player"
                  {...register('initialColor')}
                  errors={errors.initialColor}
                  disabled={afterFirst}
          >
            <option value={Color.WHITE}>White</option>
            <option value={Color.BLACK}>Black</option>
            <option value={Color.NONE}>Select randomly</option>
          </Select>
          <Checkbox label={bakuAccelerationLabel}
                    {...register('useBakuAcceleration')}
                    errors={errors.useBakuAcceleration}
                    disabled={afterFirst}
          />
        </>);
      }}
    </Form>

  );
};

export default MatchmakingForm;
