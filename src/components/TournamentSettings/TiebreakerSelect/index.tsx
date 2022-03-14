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

import { faAngleLeft, faAnglesLeft, faAngleRight, faAnglesRight, faAngleUp, faAnglesUp, faAngleDown, faAnglesDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { FunctionalComponent, h, Ref } from 'preact';
import { Suspense, lazy } from 'preact/compat';
import { useState } from 'preact/hooks';

import Tiebreaker, { tiebreakers } from '#/Tiebreaker/Tiebreaker';

import 'styles/react-dual-listbox.scss';

// We have to lazy import component. It interferes with SSR
// even with typeof window guard
const DualListBox = lazy(() => import('react-dual-listbox'));

const options = Object.values(tiebreakers).map(value => ({
  value: value.key, label: value.name
}));

const icons = {
  moveLeft: <Icon icon={faAngleLeft} />,
  moveAllLeft: <Icon icon={faAnglesLeft} />,
  moveRight: <Icon icon={faAngleRight} />,
  moveAllRight: <Icon icon={faAnglesRight} />,
  moveDown: <Icon icon={faAngleDown} />,
  moveUp: <Icon icon={faAngleUp} />,
  moveTop: <Icon icon={faAnglesUp} />,
  moveBottom: <Icon icon={faAnglesDown} />,
};

interface IProps {
  defaultValues?: Tiebreaker[];
  selectedRef?: Ref<HTMLSelectElement | undefined>;
}

const TiebreakerSelect: FunctionalComponent<IProps> = ({ defaultValues, selectedRef }) => {
  const [selected, setSelected] = useState<Tiebreaker[]>(defaultValues ?? []);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DualListBox
        className="select is-multiple"
        canFilter
        filterPlaceholder="Search..."
        options={options}
        selected={selected}
        onChange={setSelected}
        preserveSelectOrder
        showOrderButtons={true}
        icons={icons}
        selectedRef={(ref) => {
          if (typeof selectedRef === 'function') {
            selectedRef(ref);
          } else if (selectedRef) {
            selectedRef.current = ref;
          }
        }}
      />
    </Suspense>
  );
};

export default TiebreakerSelect;
