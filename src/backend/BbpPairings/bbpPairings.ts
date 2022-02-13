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

import createBbpModule from './bbpPairingsWasm.js';

interface BbpPairingsEmscriptenModule extends EmscriptenModule {
    FS: typeof FS;
    callMain: (args: Array<string>) => number;
}

type ModuleInitialize = Partial<BbpPairingsEmscriptenModule |
  {
    // Patching out types to include passed in module object for correct FS reference
    preRun: Array<{ (createdModule: BbpPairingsEmscriptenModule): void }>
  }
>

let privateInstance: BbpPairings;

export interface BbpResult {
  data: string[],
  errorOutput: string[],
  statusCode: StatusCode,
}

export const enum StatusCode {
  Success = 0,
  NoValidPairing = 1,
  UnexpectedError = 2,
  InvalidRequest = 3,
  LimitExceeded = 4,
  FileError = 5,
}

export default class BbpPairings {
  // eslint-disable-next-line no-useless-constructor
  private constructor() {/* Use factory method instead */}

  static async getInstance(): Promise<BbpPairings> {
    if (!privateInstance) {
      const wrapper = new BbpPairings();
      privateInstance = await createBbpModule(wrapper.Module).then((instance: BbpPairingsEmscriptenModule) => {
        wrapper.bbpInstance = instance;
        return wrapper;
      });
    }

    return privateInstance;
  }

  private charsRead = 0;
  private output: string[] = [];
  private errorOutput: string[] = [];

  private bbpInstance: BbpPairingsEmscriptenModule | undefined;

  private Module: ModuleInitialize = {
    preRun: [(module: BbpPairingsEmscriptenModule): void => {
      const stdin = () => null;

      let stdoutBuffer = '';
      const stdout = (code: number /* char code */) => {
        if (code === '\n'.charCodeAt(0) && stdoutBuffer !== '') {
          this.output.push(stdoutBuffer);
          stdoutBuffer = '';
        } else {
          stdoutBuffer += String.fromCharCode(code);
        }
      };

      let stderrBuffer = '';
      const stderr = (code: number /* char code */) => {
        if (code === '\n'.charCodeAt(0) && stderrBuffer !== '') {
          this.errorOutput.push(stderrBuffer);
          stderrBuffer = '';
        } else {
          stderrBuffer += String.fromCharCode(code);
        }
      };

      module.FS.init(stdin, stdout, stderr);
    }],

    print: () => { /* suppress console logs */ },

    printErr: () => { /* suppress console logs */ },

    noInitialRun: true,
  };

  private resetOutput() {
    this.charsRead = 0;
    this.output = [];
    this.errorOutput = [];
  }

  invoke = (input: string | string[]): BbpResult => {
    if (this.bbpInstance === undefined) {
      throw new Error('BbpPairings module has not been initialized');
    }

    this.resetOutput();

    const fs = this.bbpInstance.FS;
    const tmpFile = 'input';

    if (typeof input === 'string') {
      fs.writeFile(tmpFile, input);
    } else {
      fs.writeFile(tmpFile, input.join('\n'));
    }

    const code = this.bbpInstance.callMain(['--dutch', tmpFile, '-p']);
    fs.unlink(tmpFile);

    return {
      data: this.output,
      errorOutput: this.errorOutput,
      statusCode: code,
    };
  }
}
