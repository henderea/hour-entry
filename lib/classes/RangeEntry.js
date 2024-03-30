import { moment, ensureMoment, cleanLabels } from './helpers';

export class RangeEntry {
  constructor(labels, startDate, endDate, lineNumber) {
    this._labels = cleanLabels(labels.replace(/^[=+|]\s*/, '').split(/[=:]/g));
    this._range = moment.range(ensureMoment(startDate), ensureMoment(endDate));
    this._lineNumber = lineNumber;
  }

  get labels() { return this._labels; }
  get range() { return this._range; }
  get lineNumber() { return this._lineNumber; }

  contains(date) { return this.range.contains(ensureMoment(date)); }
}
