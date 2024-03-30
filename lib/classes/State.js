import _concat from 'lodash/concat.js';
import _reduce from 'lodash/reduce.js';
import { appendTotal, determineIndex } from './helpers';
import { DateEntry } from './DateEntry';
import { RangeEntry } from './RangeEntry';
import { GroupEntry } from './GroupEntry';
import { LineEntry } from './LineEntry';
import { LabelEntry } from './LabelEntry';

export class State {
  constructor(lines) {
    this._lines = _concat([], lines);
    this._currentGroup = null;
    this._currentTotal = 0;
    this._dates = [];
    this._ranges = [];
    this._groups = [];
    this._rows = [];
    this._labelRows = [];
  }

  get lines() { return this._lines; }
  get currentGroup() { return this._currentGroup; }
  set currentGroup(value) { this._currentGroup = value; }
  get currentTotal() { return this._currentTotal; }
  set currentTotal(value) { this._currentTotal = value; }
  get dates() { return this._dates; }
  get ranges() { return this._ranges; }
  get groups() { return this._groups; }
  get rows() { return this._rows; }
  get labelRows() { return this._labelRows; }

  getLine(index) { return this.lines[determineIndex(index)]; }
  setLine(index, value) { this.lines[determineIndex(index)] = value; }

  appendTotal(index, total) { this.setLine(index, appendTotal(this.getLine(index), total)); }
  appendRangeTotal(range) { this.appendTotal(range, this.getRangeTotal(range)); }

  addRange(range) { this.ranges.push(range); }
  addRangeEntry(labels, startDate, endDate, lineNumber) { this.addRange(new RangeEntry(labels, startDate, endDate, lineNumber)); }
  addDate(date) { this.dates.push(date); }
  addDateEntry(date, value) { this.addDate(new DateEntry(date, value)); }
  addGroup(group) { this.groups.push(group); return group; }
  addGroupEntry(line, lineNumber) { return this.addGroup(new GroupEntry(line, lineNumber)); }
  addRow(row) { this.rows.push(row); }
  addRowEntry(line, value, group) { this.addRow(new LineEntry(line, value, group)); }
  addLabelRow(labelRow) { this.labelRows.push(labelRow); }
  addLabelRowEntry(line, lineNumber) { this.addLabelRow(new LabelEntry(line, lineNumber)); }

  getRangeTotal(range) { return _reduce(this.dates, (total, date) => total + date.valueIn(range), 0); }

  addToTotal(value) { this.currentTotal += value; }

  reset() {
    this.currentGroup = null;
    this.currentTotal = 0;
  }
}
