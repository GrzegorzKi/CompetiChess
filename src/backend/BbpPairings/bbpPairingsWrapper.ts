import createBbpModule from './bbpPairings.js';

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

export default class BbpPairingsWrapper {
  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    // Constructor is private on purpose - use factory method instead.
  }

  static async init(): Promise<BbpPairingsWrapper> {
    const wrapper = new BbpPairingsWrapper();
    return createBbpModule(wrapper.Module).then((instance: BbpPairingsEmscriptenModule) => {
      wrapper.bbpInstance = instance;
      return wrapper;
    }).catch((error: never) => {
      throw error;
    });
  }

  private charsRead = 0;
  private output: string[] = [];
  private errorOutput: string[] = [];

  private bbpInstance: BbpPairingsEmscriptenModule | undefined;

  private Module: ModuleInitialize = {
    preRun: [(module: BbpPairingsEmscriptenModule): void => {
      const stdin = (): null => null;

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

  invoke = (input: string | string[]): BbpResult => {
    if (this.bbpInstance === undefined) {
      throw new Error('BbpPairings module is not yet initialized!');
    }

    this.charsRead = 0;
    this.output = [];
    this.errorOutput = [];

    const fs = this.bbpInstance.FS;
    const tmpFile = 'temp.trf';

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
