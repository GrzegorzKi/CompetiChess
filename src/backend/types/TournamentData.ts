import TrfFileFormat from './TrfFileFormat';

export default class TournamentData {
  constructor(data: TrfFileFormat) {
    // No public constructor - use builder instead
    this.trfData = data;
  }

  trfData: TrfFileFormat;
}
