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

import useTournamentFormData from 'hooks/useTournamentFormData';

import style from './style.scss';
import TiebreakerForm from './TiebreakerForm';
import TournamentForm from './TournamentForm';
import TournamentFormSideMenu, { Tab } from './TournamentFormSideMenu';

import Tiebreaker from '#/Tiebreaker/Tiebreaker';
import { waitForRehydration } from '@/store';

const _TournamentSettings: FunctionalComponent = () => {
  const generalFormRef = useRef<UseFormReturn<any>>();
  const tiebreakersFormRef = useRef<HTMLSelectElement>();
  const [tab, setTab] = useState<Tab>('General');

  const tournamentData = useTournamentFormData();

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
      .map(item => item.value as unknown as Tiebreaker);

    tournamentData.general = generalFormRef.current.getValues();
    tournamentData.tiebreakers = selectedItems;

    // TODO Dispatch creating new tournament
    console.log(tournamentData);
  }, [tournamentData]);

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
      </section>
      <section class="buttons">
        <input onClick={onSubmit} value="Create" type="submit" class="button is-primary ml-auto" />
      </section>
    </article>
  );
};

const TournamentSettings: FunctionalComponent = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    waitForRehydration().then(() => {
      setReady(true);
    });
  }, []);

  return ready
    ? <_TournamentSettings />
    : <p>Loading tournament data, please wait...</p>;
};

export default TournamentSettings;
