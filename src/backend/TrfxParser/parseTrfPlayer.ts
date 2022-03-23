/*
 * Copyright (c) 2021-2022  Grzegorz Kita
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

import parseTrfGames from './parseTrfGames';

import ParseResult, { ErrorCode, isError } from '#/types/ParseResult';
import { Sex, Player } from '#/types/Tournament';
import { parseFloat, parseNumber, parsePlayerId, parseSex } from '#/utils/ParseUtils';

export function createDefaultTrfPlayer(id?: number): Player {
  return {
    id: id ?? 0,
    name: '',
    sex: Sex.UNSPECIFIED,
    title: '',
    rating: 0,
    federation: '',
    fideNumber: '',
    birthDate: '',
    rank: 0,
    games: [],
    scores: [],

    accelerations: [],

    notPlayed: [],
  };
}

export default function parseTrfPlayer(value: string): ParseResult<Player> {
  if (value.length < 80) {
    return { error: ErrorCode.INVALID_LINE };
  }

  // Rank is omitted - should be recalculated based on selected tie-breaks etc.
  const regexp = /^(?<startRank>[ \d]{4}) (?<sex>[\w ])(?<title>.{3}) (?<name>.{33}) (?<rating>[ \d]{4}) (?<fed>[\w ]{3}) (?<fideNum>[ \d]{11}) (?<birthDate>.{10}) (?<points>[ \d]\d[.,]\d) [ \d]{4}(?<games>([ ]{2}[ \d]{4} [bwBW\- ] [-+wdlWDL1=0hfuzHFUZ ]| {10})*)\s*$/;
  const match = regexp.exec(value);

  if (match === null || match.groups === undefined) {
    return { error: ErrorCode.INVALID_LINE };
  }

  const {
    startRank,
    sex,
    title,
    name,
    rating,
    fed,
    fideNum,
    birthDate,
    points,
    games,
  } = match.groups;

  const parsedPlayerId = parsePlayerId(startRank.trimStart());
  if (isError(parsedPlayerId)) {
    return parsedPlayerId;
  }

  const parsedRating = parseNumber(rating.trimStart());
  if (isError(parsedRating)) {
    return parsedRating;
  }

  const parsedFideNum = parseNumber(fideNum.trimStart());
  if (isError(parsedFideNum)) {
    return parsedFideNum;
  }

  const parsedPoints = parseFloat(points.trimStart());
  if (isError(parsedPoints)) {
    return parsedPoints;
  }

  const parsedTrfGames = parseTrfGames(games, parsedPlayerId);
  if (isError(parsedTrfGames)) {
    return parsedTrfGames;
  }

  return {
    id: parsedPlayerId,
    name: name.trim(),
    sex: parseSex(sex),
    title: title.trim(),
    rating: parsedRating,
    federation: fed.trim(),
    fideNumber: fideNum.trimStart(),
    birthDate: birthDate.trim(),
    rank: 0,
    games: parsedTrfGames,
    accelerations: [],
    scores: [],
    notPlayed: [],
  };
}
