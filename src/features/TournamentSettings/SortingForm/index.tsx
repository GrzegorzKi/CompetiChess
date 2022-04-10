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

import { FunctionalComponent, h, Ref } from 'preact';
import { MutableRef } from 'preact/hooks';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import DualListBox from 'components/DualListBox';

import style from './style.scss';

import { sorters } from '#/Sorting/Sorting';
import Sorter from '#/types/Sorter';
import { Checkbox } from '@/Field';
import Form from '@/Form';


export type ISortingFormInputs = {
  keepNumbersOnSort: boolean,
  shuffleEntries: boolean,
}

export type ISortingDefaultValues = ISortingFormInputs & { sorters: Sorter[] };

interface IProps {
  selectInputRef?: Ref<HTMLSelectElement | undefined>;
  formInputRef?: MutableRef<UseFormReturn<ISortingFormInputs> | undefined>;
  defaultValues?: ISortingDefaultValues;
  visible?: boolean;
}

const SortingForm: FunctionalComponent<IProps> = (
  { selectInputRef, formInputRef, defaultValues, visible }) => {
  const { t } = useTranslation();

  const options = Object.values(sorters).map((value, key) => ({
    value: key, label: t(value.name as any)
  }));


  return (
    <div style={visible === false ? 'display: none;' : ''}>
      <DualListBox
        options={options}
        defaultValues={defaultValues?.sorters ?? []}
        selectedRef={selectInputRef}
      />
      <Form onSubmit={() => {/**/}}
            inputRef={formInputRef}
            defaultValues={defaultValues}
            visible={visible}>
        {({ register }) => (<div class={style.form}>
          <Checkbox label={t('Keep numbers')}
                    {...register('keepNumbersOnSort')} />
          <Checkbox label={t('Shuffle unsorted entries')}
                    {...register('shuffleEntries')} />
        </div>)}
      </Form>
    </div>
  );
};

export default SortingForm;
