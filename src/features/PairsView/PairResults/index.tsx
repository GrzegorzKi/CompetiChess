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
import { useCallback, useEffect, useState } from 'preact/hooks';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'hooks/index';
import {
  selectConfiguration,
  selectPairs,
  selectPlayers,
  setResult,
} from 'reducers/tournamentReducer';

import PlayersBox from './PlayersBox';
import SetScoreBox from './SetScoreBox';

import style from './style.scss';

import { Pair, PlayersRecord } from '#/types/Tournament';
import { blankResult, ComputedResults } from '#/utils/ResultUtils';
import Modal from '@/modals/Modal';

function getResult(pair: Pair, players: PlayersRecord, round: number) {
  const white = players[pair.white];
  const black = players[pair.black];
  return { w: white.games[round].result, b: black.games[round].result };
}

interface IProps {
  pairNo: number;
  round: number;
  onClose: () => void;
  setPairNo: (pairNo: number) => void;
}

const PairResults: FunctionalComponent<IProps> = ({ pairNo, round, onClose, setPairNo }) => {
  const configuration = useAppSelector(selectConfiguration);
  const pairs = useAppSelector(selectPairs);
  const players = useAppSelector(selectPlayers);
  const dispatch = useAppDispatch();

  const pairsRound = pairs?.[round];
  const pair = pairsRound?.[pairNo - 1];

  const [score, setScore] = useState<ComputedResults>(() => {
    if (pair && players) {
      return getResult(pair, players.index, round);
    }
    return blankResult;
  });

  useEffect(() => {
    if (pair && players) {
      setScore(getResult(pair, players.index, round));
    } else {
      setScore(blankResult);
    }
  }, [pair, players, round]);

  const onConfirm = useCallback((result: ComputedResults = score) => {
    dispatch(setResult({ pairNo, round, type: result }));
    onClose();
  }, [dispatch, onClose, pairNo, round, score]);

  const prevPairFn = useCallback(() => {
    if (pairNo > 1) {
      dispatch(setResult({ pairNo, round, type: score }));
      setPairNo(pairNo - 1);
    }
  }, [dispatch, pairNo, round, score, setPairNo]);

  const nextPairFn = useCallback(() => {
    if (pairs && pairNo < pairs[round].length) {
      dispatch(setResult({ pairNo, round, type: score }));
      setPairNo(pairNo + 1);
    }
  }, [dispatch, pairNo, pairs, round, score, setPairNo]);

  if (!configuration || !players || !pairs || !pair) {
    return null;
  }

  return (
    <>
      <header class="modal-card-head">
        <p class="modal-card-title">Edit result</p>
        <button class="delete" aria-label="close" onClick={onClose} />
      </header>
      <section class={`modal-card-body ${style.flex}`}>
        <PlayersBox white={players.index[pair.white]} black={players.index[pair.black]} />
        <SetScoreBox score={score} setScore={setScore} onConfirm={onConfirm} />
      </section>
      <footer class="modal-card-foot" style="overflow-x: auto;">
        <button class="button is-success" onClick={() => onConfirm()}>OK</button>
        <button class="button is-outlined" onClick={onClose}>Cancel</button>
        <button class="button is-outlined is-info ml-auto" disabled={pairNo <= 1}
                onClick={prevPairFn}>Previous</button>
        <button class="button is-outlined is-info" disabled={pairNo >= pairsRound.length}
                onClick={nextPairFn}>Next</button>
      </footer>
    </>
  );
};

interface IModalProps {
  pairNo: number;
  round: number;
  setPairNo: (pairNo: number) => void;
}

const PairResultsModal: FunctionalComponent<IModalProps> = ({ pairNo, round, setPairNo }) => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const isOpen = !!state && 'selectedPair' in (state as any);

  const onClose = () => isOpen && navigate(-1);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit result modal"
    >
      <PairResults pairNo={pairNo} round={round}
                   onClose={onClose}
                   setPairNo={setPairNo}
      />
    </Modal>
  );
};

export default PairResultsModal;
