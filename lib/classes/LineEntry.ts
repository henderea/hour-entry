import type { GroupEntry } from './GroupEntry';
import type { RangeEntry } from './RangeEntry';
import _difference from 'lodash/difference.js';
import { cleanLabels, empty } from './helpers';

export class LineEntry {
  private readonly _line: string;
  private readonly _labels: string[];
  private readonly _value: number;
  private readonly _group: GroupEntry;

  constructor(line: string, value: number, group: GroupEntry) {
    this._line = line;
    this._labels = cleanLabels(line.replace(/^[=+|]\s*/, '').split(/[=:]/g));
    this._value = value;
    this._group = group;
  }

  get line(): string { return this._line; }
  get labels(): string[] { return this._labels; }
  get value(): number { return this._value; }
  get group(): GroupEntry { return this._group; }

  matchesAllLabels(labels: string[]): boolean {
    let unmatchedLabels: string[] = cleanLabels(labels);
    unmatchedLabels = _difference(unmatchedLabels, this.labels);
    if(!empty(unmatchedLabels) && this.group && !empty(this.group.labels)) {
      unmatchedLabels = _difference(unmatchedLabels, this.group.labels);
    }
    return empty(unmatchedLabels);
  }

  in(range: RangeEntry): boolean { return this.group && this.group.in(range); }
}
