import ParseResult, { ErrorCode, isError } from '../types/ParseResult';
import {
  parseSex, Sex, TrfGame, TrfPlayer
} from '../types/TrfxFileFormat';

import parseTrfGames from './parseTrfGames';
import { tryParseFloat, tryParseNumber, validateIsInRange } from './ParseUtils';

const maxPlayers = 9999;
const maxPoints = 1998;
const maxRating = 9999;

export default function parseTrfPlayer(line: string): ParseResult<TrfPlayer> {
  const trfPlayer: TrfPlayer = {
    startingRank: 0,
    name: '',
    sex: Sex.UNSPECIFIED,
    title: '',
    rating: 0,
    federation: '',
    id: 0,
    birthDate: '',
    points: 0,
    rank: 0,
    games: new Map<number, TrfGame>(),
  };

  const parsePlayer = (): ParseResult<TrfPlayer> => {
    if (line.length < 84) {
      return { error: ErrorCode.INVALID_LINE };
    }

    const regexp = /^(?<startRank>[ \d]{4}) (?<sex>[\w ])(?<title>.{3}) (?<name>.{33}) (?<rating>[ \d]{4}) (?<fed>[\w ]{3}) (?<id>[ \d]{11}) (?<birthDate>.{10}) (?<points>[ \d]\d[.,]\d}) (?<rank>[ \d]{4})(?<games>(:[ ]{2}[ \d]{4} [bwBW\- ] [-+wdlWDL1=0hfuzHFUZ ]| {10})*)\s*$/;
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
      rank,
      games,
    } = match.groups;

    const parsedStartingRank = tryParseNumber(startRank.trimLeft());
    if (isError(parsedStartingRank)) {
      return parsedStartingRank;
    }
    const validatedStartingRank = validateIsInRange(parsedStartingRank, 1, maxPlayers);
    if (isError(validatedStartingRank)) {
      return { error: validatedStartingRank.error, what: `${parsedStartingRank} exceeds max players value of ${maxPlayers}` };
    }
    trfPlayer.startingRank = validatedStartingRank;

    const parsedRating = tryParseNumber(rating.trimLeft());
    if (isError(parsedRating)) {
      return parsedRating;
    }
    const validatedRating = validateIsInRange(parsedRating, 0, maxRating);
    if (isError(validatedRating)) {
      return { error: validatedRating.error, what: `${parsedRating} exceeds max rating value of ${maxRating}` };
    }
    trfPlayer.rating = validatedRating;

    const parsedId = tryParseNumber(id.trimLeft());
    if (isError(parsedId)) {
      return parsedId;
    }
    trfPlayer.id = parsedId;

    const parsedPoints = tryParseFloat(points.trimLeft());
    if (isError(parsedPoints)) {
      return parsedPoints;
    }
    const validatedPoints = validateIsInRange(parsedPoints, 0, maxPoints);
    if (isError(validatedPoints)) {
      return { error: validatedPoints.error, what: `${parsedPoints} exceeds max points value of ${maxPoints}` };
    }
    trfPlayer.points = validatedPoints;

    const parsedRank = tryParseNumber(rank.trimLeft());
    if (isError(parsedRank)) {
      return parsedRank;
    }
    trfPlayer.rank = parsedRank;

    trfPlayer.name = name;
    trfPlayer.sex = parseSex(sex);
    trfPlayer.title = title;
    trfPlayer.federation = fed;

    // Might possibly be parsed later to ISO Date or recognized?
    trfPlayer.birthDate = birthDate;

    const parsedTrfGames = parseTrfGames(games);
    if (isError(parsedTrfGames)) {
      return parsedTrfGames;
    }

    trfPlayer.games = parsedTrfGames;

    return trfPlayer;
  };

  return parsePlayer();
}
