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

import { numberComparatorInv } from '#/utils/SortUtils';

/** Made by: bryc (https://stackoverflow.com/users/815680/bryc) */
export const cyrb53 = (str: string, seed = 0): number => {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1>>>0);
};

export const isInStandaloneMode = (): boolean =>
  typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in window.navigator)
    || document.referrer.includes('android-app://'));

export const isInStandaloneOrFullscreenMode = (): boolean =>
  typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || ('standalone' in window.navigator)
    || document.referrer.includes('android-app://'));

/**
 * Compares two arrays if they have identical values, in order.
 *
 * This function only works for arrays with scalar values,
 * or when using objects and comparing by reference.
 */
export const arrayEquals = <T extends unknown>(first: T[], second: T[]): boolean => {
  return first.length === second.length
    && first.every((value, index) => value === second[index]);
};

export type Differences = {
  added: number[];
  removed: number[];
}

export const difference = (old: number[], current: number[]): Differences => {
  const a = old.slice().sort(numberComparatorInv);
  const b = current.slice().sort(numberComparatorInv);
  const added: number[] = [];
  const removed: number[] = [];

  let aI = a.length - 1;
  let bI = b.length - 1;
  while (aI >= 0 && bI >= 0) {
    if (a[aI] > b[bI]) {
      added.push(b[bI]);
      bI -= 1;
    } else if (a[aI] < b[bI]) {
      removed.push(a[aI]);
      aI -= 1;
    } else {
      aI -= 1;
      bI -= 1;
    }
  }

  while (aI >= 0) {
    removed.push(a[aI]);
    aI -= 1;
  }
  while (bI >= 0) {
    added.push(b[bI]);
    bI -= 1;
  }

  return { added, removed };
};

export function intersection(a: number[], b: number[]): number[] {
  a = a.slice().sort(numberComparatorInv);
  b = b.slice().sort(numberComparatorInv);

  let aI = a.length - 1;
  let bI = b.length - 1;
  const result: number[] = [];

  while (aI >= 0 && bI >= 0) {
    if      (a[aI] < b[bI] ){ aI -= 1; }
    else if (a[aI] > b[bI] ){ bI -= 1; }
    else {
      result.push(a[aI]);
      aI -= 1;
      bI -= 1;
    }
  }

  return result;
}

export function getDataIndex(element?: HTMLElement | null): number | undefined {
  const index = element?.dataset['index'];
  if (index !== undefined) {
    return +index;
  }
  return undefined;
}

export function selectToNumberArray(selectEl: HTMLSelectElement): number[] {
  return Array.from(selectEl.options)
    .map(item => Number.parseInt(item.value, 10));
}
