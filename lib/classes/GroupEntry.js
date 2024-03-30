import { cleanLabels, ensureMoment } from './helpers';

const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}):/;

export class GroupEntry {
  constructor(line, lineNumber) {
    this._line = line;
    let m = dateRegex.exec(line);
    if(m && m[1]) {
      this._date = ensureMoment(m[1]);
    } else {
      this._date = null;
    }
    this._labels = cleanLabels(line.replace(/^[=+|]\s*/, '').split(/[=:]/g));
    this._lineNumber = lineNumber;
  }

  get line() { return this._line; }
  get date() { return this._date; }
  get labels() { return this._labels; }
  get lineNumber() { return this._lineNumber; }

  in(range) { return this.date && range.contains(this.date); }
}
