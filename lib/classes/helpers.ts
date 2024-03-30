import type { Moment } from 'moment';

import _map from 'lodash/map.js';
import _isNil from 'lodash/isNil.js';
import _compact from 'lodash/compact.js';
import _moment from 'moment';
import { extendMoment } from 'moment-range';
// @ts-expect-error - No proper typescript support from moment-range
const moment = extendMoment(_moment);

function formatTime(mins: number): string {
  if(mins < 60) {
    return `${mins}m`;
  }
  if(mins % 60 === 0) {
    return `${Math.floor(mins / 60)}h`;
  }
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function appendTotal(line: string, total: number): string {
  const formattedTotal: string = formatTime(total);
  if(/\s+$/.test(line)) {
    return `${line}${formattedTotal}`;
  } else {
    return `${line} ${formattedTotal}`;
  }
}

export type IndexValue = { lineNumber: number } | number;

function determineIndex(index: IndexValue): number {
  if(typeof index == 'number') { return index; }
  return index.lineNumber;
}

function ensureMoment(m: Moment | string): Moment {
  if(moment.isMoment(m)) { return m; }
  return moment(m, 'MM/DD/YYYY');
}

function asArray<T>(a: T | T[]): T[] {
  return Array.isArray(a) ? a : [a];
}

function getItem<T>(a: T[] | null, i: number): T | null {
  return a && a[i];
}

function empty<T>(s: T[] | string | null | undefined): s is [] | '' | null | undefined {
  return !s || s.length <= 0;
}

function cleanLabels(labels: string[]): string[] {
  return _compact(_map(labels, (l) => !empty(l) && /\S/.test(l) && l.trim()));
}

export {
  moment,
  formatTime,
  appendTotal,
  determineIndex,
  ensureMoment,
  asArray,
  getItem,
  empty,
  cleanLabels,
  Moment
};
