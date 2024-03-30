import { cleanLabels } from './helpers';

export class LabelEntry {
  private readonly _line: string;
  private readonly _labels: string[];
  private readonly _lineNumber: number;

  constructor(line: string, lineNumber: number) {
    this._line = line;
    this._labels = cleanLabels(line.replace(/^[=+|]\s*/, '').split(/[=:]/g));
    this._lineNumber = lineNumber;
  }

  get line(): string { return this._line; }
  get labels(): string[] { return this._labels; }
  get lineNumber(): number { return this._lineNumber; }
}
