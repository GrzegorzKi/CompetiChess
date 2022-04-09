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

import { faBook } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { FunctionalComponent, h, JSX } from 'preact';
import { useTranslation } from 'react-i18next';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import { useModalContext } from 'features/SavedTournamentsPanel/ModalProvider';
import { routes } from 'utils/index';

import { TournamentEntry } from '..';
import DeleteTournamentButton from '../DeleteTournamentButton';
import ExportTournamentButton from '../ExportTournamentButton';
import LoadTournamentButton, { loadTournament } from '../LoadTournamentButton';

import SaveTournamentButton from '../SaveTournamentButton';

import style from './style.scss';

import { store } from '@/store';

interface PanelBlockProps extends TournamentEntry {
  isActive?: true,
}

async function loadOrEnterTournament(
  event: JSX.TargetedMouseEvent<HTMLAnchorElement>,
  id: string,
  navigate: NavigateFunction,
  isActive?: boolean,
  onSaveGuard?: () => Promise<boolean>
) {
  if (event.detail > 1 /* Double click */ && event.button === 0 /* Main button */) {
    event.preventDefault();
    const isModified = store.getState().flags.isModified;
    if (!isActive) {
      await loadTournament(id, isModified, onSaveGuard);
    } else {
      navigate(routes.pairs.path);
    }
  }
}

const PanelBlock: FunctionalComponent<PanelBlockProps> = ({ name, id, created, updated, isActive }) => {
  const { t } = useTranslation();
  
  const { onSaveGuard, onDeleteGuard } = useModalContext();
  const navigate = useNavigate();

  const createdDate = new Date(created).toLocaleString();
  const updatedDate = updated && new Date(updated).toLocaleString();

  return (
    <a tabIndex={0} class={`panel-block trans-bg ${style.panelBlock}${isActive ? ' is-active' : ''}`}
       onClick={(e) => loadOrEnterTournament(e, id, navigate, isActive, onSaveGuard)}
    >
      <span class="panel-icon">
        <Icon icon={faBook} />
      </span>
      <span class={style.name}>{name}</span>
      <span class={style.subText}>({id})</span>
      <span style="width: 100%" />
      <span class={style.subText} style="margin-right: 0.75em">{t('Created')}{': '}<strong>{createdDate}</strong></span>
      {updatedDate && <span class={style.subText}>{t('Updated')}{': '}<strong>{updatedDate}</strong></span>}
      <div class={style.panelButtons}>
        {isActive
          ? <SaveTournamentButton />
          : <LoadTournamentButton id={id} onSaveGuard={onSaveGuard} />}
        <ExportTournamentButton id={id} />
        <DeleteTournamentButton id={id} onDeleteGuard={onDeleteGuard} />
      </div>
    </a>
  );
};

export const NoResultsPanelBlock = ({ query }: { query: string }): JSX.Element => {
  const { t } = useTranslation();

  return <span class="panel-block">{t('No results')}&nbsp;<b>{query}</b></span>;
};

export const NoTournamentsBlock = (): JSX.Element => {
  const { t } = useTranslation();

  return <span class="panel-block">{t('No tournaments')}</span>;
};

export default PanelBlock;
