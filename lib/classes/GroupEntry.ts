import type { Moment } from './helpers';
import type { RangeEntry } from './RangeEntry';
import { cleanLabels, ensureMoment } from './helpers';

const dateRegex: RegExp = /(\d{1,2}\/\d{1,2}\/\d{4}):/;

export class GroupEntry {
  private readonly _line: string;
  private readonly _date: Moment | null;
  private readonly _labels: string[];
  private readonly _lineNumber: number;

  constructor(line: string, lineNumber: number) {
    this._line = line;
    const m: RegExpExecArray | null = dateRegex.exec(line);
    if(m && m[1]) {
      this._date = ensureMoment(m[1]);
    } else {
      this._date = null;
    }
    this._labels = cleanLabels(line.replace(/^[=+|]\s*/, '').split(/[=:]/g));
    this._lineNumber = lineNumber;
  }

  get line(): string { return this._line; }
  get date(): Moment | null { return this._date; }
  get labels(): string[] { return this._labels; }
  get lineNumber(): number { return this._lineNumber; }

  in(range: RangeEntry): boolean { return !!this.date && range.contains(this.date); }
}
