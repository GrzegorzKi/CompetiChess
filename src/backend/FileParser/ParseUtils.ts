import ParseResult, { ErrorCode } from '../types/ParseResult';

export const tryParseNumber = (value: string): ParseResult<number> => {
  if (value === '') {
    return 0;
  }

  const num = Number.parseInt(value, 10);
  if (Number.isNaN(num)) {
    return { error: ErrorCode.NOT_A_NUMBER };
  }
  return num;
};

export const tryParseFloat = (value: string): ParseResult<number> => {
  if (value === '') {
    return 0;
  }

  const valueDot = value.replace(/,/g, '.');
  const num = Number.parseFloat(valueDot);
  if (Number.isNaN(num)) {
    return { error: ErrorCode.NOT_A_NUMBER };
  }
  return num;
};

export const validateIsInRange = (num: number, min: number, max: number): ParseResult<number> => {
  if (num < min || num > max) {
    return { error: ErrorCode.UNSUPPORTED_VALUE };
  }
  return num;
};
