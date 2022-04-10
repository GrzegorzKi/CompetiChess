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
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from 'hooks/index';
import useTournamentFormData from 'hooks/useTournamentFormData';
import { createTournament, selectPairs, updateTournament } from 'reducers/tournamentReducer';

import { selectToNumberArray } from 'utils/common';
import { routes } from 'utils/index';
import { saveTournamentUnlessNotPersisted } from 'utils/localStorageUtils';
import { toggleLoading } from 'utils/modalUtils';

import MatchmakingForm from './MatchmakingForm';
import SortingForm from './SortingForm';
import style from './style.scss';
import TiebreakerForm from './TiebreakerForm';
import TournamentForm from './TournamentForm';
import TournamentFormSideMenu from './TournamentFormSideMenu';

import { waitForRehydration } from '@/store';
import TransText from '@/TransText';


export type Tab = 'General' | 'Matchmaking' | 'Tiebreakers' | 'Sorting';

interface IProps {
  isCreate?: boolean;
}

const _TournamentSettings: FunctionalComponent<IProps> = ({ isCreate }) => {
  const { t } = useTranslation();

  const generalFormRef = useRef<UseFormReturn<any>>();
  const matchmakingFormRef = useRef<UseFormReturn<any>>();
  const tiebreakersFormRef = useRef<HTMLSelectElement>();
  const sortingSelectRef = useRef<HTMLSelectElement>();
  const sortingFormRef = useRef<UseFormReturn<any>>();
  const [tab, setTab] = useState<Tab>('General');

  const pairs = useAppSelector(selectPairs);
  const tournamentData = useTournamentFormData(isCreate);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = useCallback(async () => {
    if (!generalFormRef.current
      || !tiebreakersFormRef.current
      || !matchmakingFormRef.current
      || !sortingFormRef.current
      || !sortingSelectRef.current) {
      return;
    }

    const isGeneralValid = await generalFormRef.current.trigger();
    if (!isGeneralValid) { setTab('General'); return; }

    const isMatchmakingValid = await matchmakingFormRef.current.trigger();
    if (!isMatchmakingValid) { setTab('Matchmaking'); return; }

    tournamentData.general = generalFormRef.current.getValues();
    tournamentData.matchmaking = matchmakingFormRef.current.getValues();
    tournamentData.tiebreakers = selectToNumberArray(tiebreakersFormRef.current);
    tournamentData.sorters = sortingFormRef.current.getValues();
    tournamentData.sorters.sorters = selectToNumberArray(sortingSelectRef.current);

    if (isCreate) {
      tournamentData.general.createdDate = Date.now();

      dispatch(createTournament(tournamentData));
      toast.success(<TransText i18nKey="Tournament created" />);
      navigate(routes.tournaments.path);
    } else {
      dispatch(updateTournament(tournamentData));
      try {
        saveTournamentUnlessNotPersisted();
        toast.info(<TransText i18nKey="Tournament updated" />);
      } catch (e) {
        toast.error(<TransText i18nKey="Unable to save" />);
      }
    }
  }, [dispatch, isCreate, navigate, tournamentData]);

  return (
    <article class={`panel is-primary ${style.panel}`}>
      <p class="panel-heading">
        {t('Tournament settings')}
      </p>
      <section class={style.content}>
        <TournamentForm inputRef={generalFormRef}
                        defaultValues={tournamentData.general}
                        visible={tab === 'General'} />
        <MatchmakingForm inputRef={matchmakingFormRef}
                         defaultValues={tournamentData.matchmaking}
                         visible={tab === 'Matchmaking'}
                         afterFirst={!isCreate && !!pairs && pairs.length > 0} />
        <TiebreakerForm inputRef={tiebreakersFormRef}
                        defaultValues={tournamentData.tiebreakers}
                        visible={tab === 'Tiebreakers'} />
        <SortingForm selectInputRef={sortingSelectRef}
                     formInputRef={sortingFormRef}
                     defaultValues={tournamentData.sorters}
                     visible={tab === 'Sorting'} />
        <TournamentFormSideMenu activeTab={tab} onChange={(_tab) => setTab(_tab)} />
        <section class={`buttons ${style.buttons}`}>
          <button type="submit" class="button is-success ml-auto"
                  onClick={(e) => toggleLoading(e, onSubmit)}>
            {isCreate ? t('Create') : t('Apply')}
          </button>
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
    : null;
};

export default TournamentSettings;
