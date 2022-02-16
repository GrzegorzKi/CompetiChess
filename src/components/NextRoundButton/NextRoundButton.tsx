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

import { ComponentChildren, h } from 'preact';
import { useCallback, useRef } from 'preact/hooks';

import BbpPairings from '#/BbpPairings/bbpPairings';
import exportToTrf from '#/DataExport/exportToTrf';
import checkPairingsFilled from '#/Pairings/checkPairingsFilled';
import { readPairs } from '#/Pairings/Pairings';
import { ParsingErrors, ValidTrfData } from '#/TrfxParser/parseTrfFile';
import { getDetails, isError } from '#/types/ParseResult';
import { evenUpMatchHistories } from '#/utils/GamesUtils';
import { recalculatePlayerScores } from '#/utils/TournamentUtils';

interface Props {
  tournament: ValidTrfData;
  onSuccess: (data: ValidTrfData) => void;
  onFailure?: (errors: ParsingErrors) => void;
  children: ComponentChildren;
}

const NextRoundButton = ({
  tournament,
  onSuccess: onSuccessCallback,
  onFailure,
  children
}: Props) => {
  const bbpInstance = useRef<BbpPairings>();
  const onFailureCallback = useCallback((error: string | string[]) => {
    if (onFailure) {
      if (typeof error === 'string') {
        onFailure({ parsingErrors: [error] });
      } else {
        onFailure({ parsingErrors: error });
      }
    } else if (typeof error === 'string') {
      throw new Error(error);
    } else {
      throw new Error(error.join('\n'));
    }
  }, [onFailure]);

  async function startNextRound() {
    const data = tournament.trfxData;

    const {
      pairs: pairsArray,
      playedRounds
    } = data;
    const allFilled = checkPairingsFilled(pairsArray[playedRounds - 1], playedRounds);
    if (!allFilled) {
      onFailureCallback('Cannot start new round. Please fill in all pairs\' results before proceeding.');
      return;
    }

    const trfOutput = exportToTrf(
      data,
      { exportForPairing: true, forRound: data.playedRounds + 1 }
    );

    if (!bbpInstance.current) {
      bbpInstance.current = await BbpPairings.getInstance();
    }
    const bbpResult = bbpInstance.current.invoke(trfOutput!);

    console.info(bbpResult);

    if (bbpResult.statusCode !== 0) {
      onFailureCallback(bbpResult.errorOutput.join('\n'));
      return;
    }

    const pairs = readPairs({
      players: data.players,
      pairsRaw: bbpResult.data
    });
    const result = pairs.apply(data);
    if (isError(result)) {
      onFailureCallback(getDetails(result));
      return;
    }

    evenUpMatchHistories(data.players, data.playedRounds);
    recalculatePlayerScores(data, data.playedRounds);

    data.playedRounds += 1;

    onSuccessCallback(tournament);
  }

  return <button class="button is-primary trans-bg is-block mb-5" onClick={startNextRound}>
    {children}
  </button>;
};

export default NextRoundButton;
