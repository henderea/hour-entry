import type { DateRange } from 'moment-range';
import type { Moment } from './helpers';
import { moment, ensureMoment, cleanLabels } from './helpers';

export class RangeEntry {
  private readonly _labels: string[];
  private readonly _range: DateRange;
  private readonly _lineNumber: number;

  constructor(labels: string, startDate: Moment | string, endDate: Moment | string, lineNumber: number) {
    this._labels = cleanLabels(labels.replace(/^[=+|]\s*/, '').split(/[=:]/g));
    this._range = moment.range(ensureMoment(startDate), ensureMoment(endDate));
    this._lineNumber = lineNumber;
  }

  get labels(): string[] { return this._labels; }
  get range(): DateRange { return this._range; }
  get lineNumber(): number { return this._lineNumber; }

  contains(date: Moment | string): boolean { return this.range.contains(ensureMoment(date)); }
}
