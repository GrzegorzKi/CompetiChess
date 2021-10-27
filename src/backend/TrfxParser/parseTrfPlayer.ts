import ParseResult, { ErrorCode, isError } from '../types/ParseResult';
import { Sex, TrfPlayer } from '../types/TrfFileFormat';

import parseTrfGames from './parseTrfGames';
import { parseFloat, parseNumber, parsePlayerId } from './ParseUtils';
import { parseSex } from './TrfUtils';

export function createDefaultTrfPlayer(): TrfPlayer {
  return {
    playerId: 0,
    name: '',
    sex: Sex.UNSPECIFIED,
    title: '',
    rating: 0,
    federation: '',
    id: 0,
    birthDate: '',
    points: 0,
    rank: 0,
    games: [],

    isDummy: true,
    accelerations: [],
  };
}

export default function parseTrfPlayer(line: string, players: TrfPlayer[]): ParseResult<TrfPlayer> {
  if (line.length < 84) {
    return { error: ErrorCode.INVALID_LINE };
  }

  // Rank is omitted - should be recalculated based on selected tie-breaks etc.
  const regexp = /^.{4}(?<startRank>[ \d]{4}) (?<sex>[\w ])(?<title>.{3}) (?<name>.{33}) (?<rating>[ \d]{4}) (?<fed>[\w ]{3}) (?<id>[ \d]{11}) (?<birthDate>.{10}) (?<points>[ \d]\d[.,]\d}) [ \d]{4}(?<games>(:[ ]{2}[ \d]{4} [bwBW\- ] [-+wdlWDL1=0hfuzHFUZ ]| {10})*)\s*$/;
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

  const player: TrfPlayer = {
    playerId: parsedPlayerId,
    name,
    sex: parseSex(sex),
    title,
    rating: parsedRating,
    federation: fed,
    id: parsedId,
    birthDate,
    points: parsedPoints,
    rank: 0,
    games: parsedTrfGames,

    isDummy: false,
    accelerations: [],
  };

  if (players[parsedPlayerId] !== undefined) {
    if (!players[parsedPlayerId].isDummy) {
      return { error: ErrorCode.PLAYER_DUPLICATE };
    }
    player.accelerations = players[parsedPlayerId].accelerations;
  }

  return player;
}
