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
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAppDispatch } from 'hooks/index';
import useTournamentFormData from 'hooks/useTournamentFormData';
import { createTournament, updateTournament } from 'reducers/tournamentReducer';

import { routes } from 'utils/index';

import style from './style.scss';
import TiebreakerForm from './TiebreakerForm';
import TournamentForm from './TournamentForm';
import TournamentFormSideMenu, { Tab } from './TournamentFormSideMenu';

import { saveTournamentUnlessNotPersisted } from '@/SavedTournamentsPanel/SaveTournamentButton';
import { waitForRehydration } from '@/store';


interface IProps {
  isCreate?: boolean;
}

const _TournamentSettings: FunctionalComponent<IProps> = ({ isCreate }) => {
  const generalFormRef = useRef<UseFormReturn<any>>();
  const tiebreakersFormRef = useRef<HTMLSelectElement>();
  const [tab, setTab] = useState<Tab>('General');

  const tournamentData = useTournamentFormData(isCreate);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = useCallback(async () => {
    if (!generalFormRef.current || !tiebreakersFormRef.current) {
      return;
    }

    const isValid = await generalFormRef.current.trigger();
    if (!isValid) {
      setTab('General');
      return;
    }

    const selectedItems = Array
      .from(tiebreakersFormRef.current.options)
      .map(item => Number.parseInt(item.value, 10));

    tournamentData.general = generalFormRef.current.getValues();
    tournamentData.tiebreakers = selectedItems;

    if (isCreate) {
      tournamentData.general.createdDate = Date.now();
      dispatch(createTournament(tournamentData));
      toast.success('Tournament has been created!');
      navigate(routes.tournaments.path);
    } else {
      dispatch(updateTournament(tournamentData));
      saveTournamentUnlessNotPersisted();
      toast.info('Tournament has been updated');
    }
  }, [dispatch, isCreate, navigate, tournamentData]);

  return (
    <article class={`panel is-primary ${style.panel}`}>
      <p class="panel-heading">
        Tournament settings
      </p>
      <section class={style.content}>
        <TournamentFormSideMenu activeTab={tab} onChange={(_tab) => setTab(_tab)} />
        <TournamentForm inputRef={generalFormRef}
                        defaultValues={tournamentData.general}
                        visible={tab === 'General'} />
        <TiebreakerForm inputRef={tiebreakersFormRef}
                        defaultValues={tournamentData.tiebreakers}
                        visible={tab === 'Tiebreakers'} />
        <section className={`buttons ${style.buttons}`}>
          <input onClick={onSubmit} value={isCreate ? 'Create' : 'Apply'} type="submit"
                 className="button is-primary ml-auto" />
        </section>
      </section>
    </article>
  );
};

const TournamentSettings: FunctionalComponent<IProps> = (props) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    waitForRehydration().then(() => {
      setReady(true);
    });
  }, []);

  return ready
    ? <_TournamentSettings {...props} />
    : <p>Loading tournament data, please wait...</p>;
};

export default TournamentSettings;
