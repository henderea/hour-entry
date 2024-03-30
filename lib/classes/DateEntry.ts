import type { RangeEntry } from './RangeEntry';
import type { Moment } from './helpers';
import { ensureMoment } from './helpers';

export class DateEntry {
  private readonly _date: Moment;
  private readonly _value: number;

  constructor(date: Moment | string, value: number) {
    this._date = ensureMoment(date);
    this._value = value;
  }

  get date(): Moment { return this._date; }
  get value(): number { return this._value; }

  in(range: RangeEntry): boolean { return range.contains(this.date); }
  valueIn(range: RangeEntry): number { return this.in(range) ? this.value : 0; }
}
