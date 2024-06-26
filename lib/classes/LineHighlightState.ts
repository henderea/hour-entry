import _map from 'lodash/map.js';
import { LineHighlightLineState } from './LineHighlightLineState';

export type LineStateFormatter = (state: LineHighlightLineState, colors: Dictionary<string | null>, self: LineHighlightState) => string;
export type BoxType = 0 | 1 | 2;

export class LineHighlightState {
  private readonly _lines: string[];
  private readonly _colors: Dictionary<string | null>;
  private _currentIndex: number = -1;
  private _currentLine: string | null = null;
  private _previousLine: string | null = null;
  private _nextLine: string | null = null;
  private _currentLineState: LineHighlightLineState | null = null;
  private _previousLineState: LineHighlightLineState | null = null;
  private _nextLineState: LineHighlightLineState | null = null;
  private readonly _lineStates: LineHighlightLineState[];
  private readonly _lineStateFormatter: LineStateFormatter;
  private _boxStart: number = -1;
  private _boxType: BoxType = 0;

  constructor(lines: string[], colors: Dictionary<string | null>, lineStateFormatter: LineStateFormatter) {
    this._lines = lines;
    this._colors = colors;
    this._lineStates = _map(lines, (l) => new LineHighlightLineState(l));
    this._lineStateFormatter = lineStateFormatter;
  }

  get lines(): string[] { return this._lines; }
  get lineCount(): number { return this.lines.length; }
  get colors(): Dictionary<string | null> { return this._colors; }
  get currentIndex(): number { return this._currentIndex; }
  private get curIndex(): number { return this._currentIndex; }
  private set curIndex(value: number) {
    this._currentIndex = value;
    this._currentLine = null;
    this._nextLine = null;
    this._previousLine = null;
    this._currentLineState = null;
    this._nextLineState = null;
    this._previousLineState = null;
  }
  get currentLine(): string { return this._currentLine ||= this.lines[this.currentIndex]; }
  get previousLine(): string { return this._previousLine ||= this.lines[this.currentIndex - 1]; }
  get nextLine(): string { return this._nextLine ||= this.lines[this.currentIndex + 1]; }
  get lineStates(): LineHighlightLineState[] { return this._lineStates; }
  get currentLineState(): LineHighlightLineState { return this._currentLineState ||= this.lineStates[this.currentIndex]; }
  get previousLineState(): LineHighlightLineState { return this._previousLineState ||= this.lineStates[this.currentIndex - 1]; }
  get nextLineState(): LineHighlightLineState { return this._nextLineState ||= this.lineStates[this.currentIndex + 1]; }
  get atStart(): boolean { return this.currentIndex <= 0; }
  get atEnd(): boolean { return this.currentIndex >= this.lineCount - 1; }
  get boxStart(): number { return this._boxStart; }
  set boxStart(value: number) { this._boxStart = value; }
  get boxType(): BoxType { return this._boxType; }
  set boxType(value: BoxType) { this._boxType = value; }
  get lineStateFormatter(): LineStateFormatter { return this._lineStateFormatter; }
  get outputLines(): string[] { return _map(this.lineStates, (s: LineHighlightLineState) => this.lineStateFormatter(s, this.colors, this)); }

  boxCompatible(type: number): boolean { return this.boxType === 0 || this.boxType === type; }
  processBox(): void {
    if(this.boxType !== 1 && this.boxType !== 2) {
      this.boxStart = -1;
      return;
    }
    let maxLength: number = 0;
    let i: number;
    for(i = this.boxStart; i <= this.currentIndex; i++) {
      const length: number = this.lines[i].length;
      if(length > maxLength) {
        maxLength = length;
      }
    }
    for(i = this.boxStart; i <= this.currentIndex; i++) {
      const s: LineHighlightLineState = this.lineStates[i];
      const l: string = this.lines[i];
      if((this.boxType === 1 ? /^=*\s*$/ : /^([+|]+-*[+|]*\s*|\s*)$/).test(l)) {
        s.resetPieces();
        if(this.boxType === 1) {
          s.addPiece('='.repeat(maxLength + 2), 'box');
        } else if(this.boxType === 2) {
          s.addPiece(`+${'-'.repeat(maxLength)}+`, 'box2');
        }
      } else if(s.pieceCount > 1) {
        if(this.boxType === 1) {
          s.addPiece(`${' '.repeat(maxLength - l.length)} =`, 'box');
        } else if(this.boxType === 2) {
          s.setPiece(0, '| ', 'box2');
          s.addPiece(`${' '.repeat(maxLength - l.length)} |`, 'box2');
        }
      }
    }
    this.boxStart = -1;
    this.boxType = 0;
  }

  processLines(f: (state: LineHighlightLineState, self: LineHighlightState) => void): string[] {
    for(this.curIndex = 0; this.curIndex < this.lineCount; this.curIndex++) {
      f(this.currentLineState, this);
    }
    return this.outputLines;
  }
}
