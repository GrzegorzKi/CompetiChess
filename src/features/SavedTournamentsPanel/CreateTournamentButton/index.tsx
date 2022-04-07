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
import { useCallback } from 'preact/hooks';
import { useNavigate } from 'react-router-dom';

import { useAppSelector } from 'hooks/index';
import { selectIsModified } from 'reducers/globalReducer';
import { routes } from 'utils/index';
import { blockIfModified } from 'utils/modalUtils';

import { useModalContext } from '../ModalProvider';

const CreateTournamentButton: FunctionalComponent = () => {
  const navigate = useNavigate();

  const isModified = useAppSelector(selectIsModified);
  const { onSaveGuard } = useModalContext();

  const checkCurrentAndNavigate = useCallback(async () => {
    if (onSaveGuard && await blockIfModified(isModified, onSaveGuard)) {
      navigate(routes.createTournament.path);
    }
  }, [isModified, navigate, onSaveGuard]);

  return (
    <p className="control">
      <button className="button is-primary"
              onClick={checkCurrentAndNavigate}>
        Create tournament
      </button>
    </p>
  );
};

export default CreateTournamentButton;
