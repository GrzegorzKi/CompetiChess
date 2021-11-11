import ParseResult, { ErrorCode, isError } from '../types/ParseResult';
import { Sex, TrfPlayer } from '../types/TrfFileFormat';
import { parseFloat, parseNumber, parsePlayerId } from '../utils/ParseUtils';
import { parseSex } from '../utils/TrfUtils';

import parseTrfGames from './parseTrfGames';

export function createDefaultTrfPlayer(): TrfPlayer {
  return {
    playerId: 0,
    name: '',
    sex: Sex.UNSPECIFIED,
    title: '',
    rating: 0,
    federation: '',
    id: '',
    birthDate: '',
    points: 0,
    rank: 0,
    games: [],
    scores: [],

    accelerations: [],

    notPlayed: [],
  };
}

export default function parseTrfPlayer(line: string): ParseResult<TrfPlayer> {
  if (line.length < 84) {
    return { error: ErrorCode.INVALID_LINE };
  }

  // Rank is omitted - should be recalculated based on selected tie-breaks etc.
  const regexp = /^.{4}(?<startRank>[ \d]{4}) (?<sex>[\w ])(?<title>.{3}) (?<name>.{33}) (?<rating>[ \d]{4}) (?<fed>[\w ]{3}) (?<id>[ \d]{11}) (?<birthDate>.{10}) (?<points>[ \d]\d[.,]\d) [ \d]{4}(?<games>([ ]{2}[ \d]{4} [bwBW\- ] [-+wdlWDL1=0hfuzHFUZ ]| {10})*)\s*$/;
  const match = regexp.exec(line);

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
    id,
    birthDate,
    points,
    games,
  } = match.groups;

  const parsedPlayerId = parsePlayerId(startRank.trimLeft());
  if (isError(parsedPlayerId)) {
    return parsedPlayerId;
  }

  const parsedRating = parseNumber(rating.trimLeft());
  if (isError(parsedRating)) {
    return parsedRating;
  }

  const parsedId = parseNumber(id.trimLeft());
  if (isError(parsedId)) {
    return parsedId;
  }

  const parsedPoints = parseFloat(points.trimLeft());
  if (isError(parsedPoints)) {
    return parsedPoints;
  }

  const parsedTrfGames = parseTrfGames(games, parsedPlayerId);
  if (isError(parsedTrfGames)) {
    return parsedTrfGames;
  }

  return {
    playerId: parsedPlayerId,
    name: name.trim(),
    sex: parseSex(sex),
    title: title.trim(),
    rating: parsedRating,
    federation: fed.trim(),
    id: id.trimLeft(),
    birthDate: birthDate.trim(),
    points: parsedPoints,
    rank: 0,
    games: parsedTrfGames,
    accelerations: [],
    scores: [],
    notPlayed: [],
  };
}
