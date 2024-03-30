import type { Moment, IndexValue } from './helpers';

import _concat from 'lodash/concat.js';
import _reduce from 'lodash/reduce.js';
import { appendTotal, determineIndex } from './helpers';
import { DateEntry } from './DateEntry';
import { RangeEntry } from './RangeEntry';
import { GroupEntry } from './GroupEntry';
import { LineEntry } from './LineEntry';
import { LabelEntry } from './LabelEntry';

export class State {
  private readonly _lines: string[];
  private _currentGroup: GroupEntry | null = null;
  private _currentTotal: number = 0;
  private readonly _dates: DateEntry[] = [];
  private readonly _ranges: RangeEntry[] = [];
  private readonly _groups: GroupEntry[] = [];
  private readonly _rows: LineEntry[] = [];
  private readonly _labelRows: LabelEntry[] = [];

  constructor(lines: string[]) {
    this._lines = [...lines];
  }

  get lines(): string[] { return this._lines; }
  get currentGroup(): GroupEntry | null { return this._currentGroup; }
  set currentGroup(value: GroupEntry | null) { this._currentGroup = value; }
  get currentTotal(): number { return this._currentTotal; }
  set currentTotal(value: number) { this._currentTotal = value; }
  get dates(): DateEntry[] { return this._dates; }
  get ranges(): RangeEntry[] { return this._ranges; }
  get groups(): GroupEntry[] { return this._groups; }
  get rows(): LineEntry[] { return this._rows; }
  get labelRows(): LabelEntry[] { return this._labelRows; }

  getLine(index: IndexValue): string { return this.lines[determineIndex(index)]; }
  setLine(index: IndexValue, value: string): void { this.lines[determineIndex(index)] = value; }

  appendTotal(index: IndexValue, total: number): void { this.setLine(index, appendTotal(this.getLine(index), total)); }
  appendRangeTotal(range: RangeEntry): void { this.appendTotal(range, this.getRangeTotal(range)); }

  addRange(range: RangeEntry): void { this.ranges.push(range); }
  addRangeEntry(labels: string, startDate: Moment | string, endDate: Moment | string, lineNumber: number): void { this.addRange(new RangeEntry(labels, startDate, endDate, lineNumber)); }
  addDate(date: DateEntry): void { this.dates.push(date); }
  addDateEntry(date: Moment | string, value: number): void { this.addDate(new DateEntry(date, value)); }
  addGroup(group: GroupEntry): GroupEntry { this.groups.push(group); return group; }
  addGroupEntry(line: string, lineNumber: number): GroupEntry { return this.addGroup(new GroupEntry(line, lineNumber)); }
  addRow(row: LineEntry): void { this.rows.push(row); }
  addRowEntry(line: string, value: number, group: GroupEntry): void { this.addRow(new LineEntry(line, value, group)); }
  addLabelRow(labelRow: LabelEntry): void { this.labelRows.push(labelRow); }
  addLabelRowEntry(line: string, lineNumber: number): void { this.addLabelRow(new LabelEntry(line, lineNumber)); }

  getRangeTotal(range: RangeEntry): number { return _reduce(this.dates, (total, date) => total + date.valueIn(range), 0); }

  addToTotal(value: number): void { this.currentTotal += value; }

  reset(): void {
    this.currentGroup = null;
    this.currentTotal = 0;
  }
}
