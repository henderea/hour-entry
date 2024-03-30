import { ensureMoment } from './helpers';

export class DateEntry {
  constructor(date, value) {
    this._date = ensureMoment(date);
    this._value = value;
  }

  get date() { return this._date; }
  get value() { return this._value; }

  in(range) { return range.contains(this.date); }
  valueIn(range) { return this.in(range) ? this.value : 0; }
}
