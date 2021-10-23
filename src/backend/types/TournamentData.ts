import TrfxFileFormat from './TrfxFileFormat';

export default class TournamentData {
  constructor(data: TrfxFileFormat) {
    // No public constructor - use builder instead
    this.trfData = data;
  }

  trfData: TrfxFileFormat;
}
