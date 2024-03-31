import _map from 'lodash/map.js';
import { empty, asArray } from './helpers';

export type Piece = { text: string, type: string | null };

function makePiece(text: string | string[], type: string | null): Piece {
  return {
    text: asArray(text).join(''),
    type
  };
}

export class LineHighlightLineState {
  private readonly _line: string;
  private _currentIndex: number = -1;
  private _chars: string[];
  private _currentChar: string = '';
  private _nextChar: string = '';
  private _currentText: string = '';
  private _pieces: Piece[] = [];
  private _remainingChars: string[] | null = null;
  private _remainingText: string | null = null;

  constructor(line: string) {
    this._line = line;
    this._chars = line.split('');
  }

  get line(): string { return this._line; }
  get lineLength(): number { return this.line.length; }
  get chars(): string[] { return this._chars; }
  get currentText(): string { return this._currentText; }
  get hasText(): boolean { return !empty(this.currentText); }
  get pieces(): Piece[] { return this._pieces; }
  get pieceCount(): number { return this.pieces.length; }
  get hasPieces(): boolean { return this.pieceCount > 0; }
  get currentIndex(): number { return this._currentIndex; }
  private get curIndex(): number { return this._currentIndex; }
  private set curIndex(value: number) {
    this._currentIndex = value;
    this._currentChar = this.chars[value];
    this._nextChar = this.chars[value + 1];
    this._remainingChars = null;
    this._remainingText = null;
  }
  get currentChar(): string { return this._currentChar; }
  get nextChar(): string { return this._nextChar; }
  get atEnd(): boolean { return this.currentIndex >= this.lineLength - 1; }
  get remainingChars(): string[] { return this._remainingChars ||= this.chars.slice(this.currentIndex + 1); }
  get remainingText(): string { return this._remainingText ||= this.remainingChars.join(''); }
  get newText(): string { return this.currentText + this.currentChar; }

  addChar(): void { this._currentText += this.currentChar; }
  addPiece(text: string, type: string | null = null): void { this._pieces.push(makePiece(text, type)); }
  setPiece(index: number, text: string, type: string | null = null): void { this._pieces[index] = makePiece(text, type); }
  resetPieces(): void { this._pieces = []; }
  resetCurrentText(): void { this._currentText = ''; }
  currentTextMatches(r: RegExp): boolean { return r.test(this.currentText); }
  newTextMatches(r: RegExp): boolean { return r.test(this.newText); }
  onChar(...chars: string[]): boolean { return chars.includes(this.currentChar); }
  remainingTextMatches(r: RegExp): boolean { return r.test(this.remainingText); }
  // textPart(r: RegExp, i: number): string { return getItem(r.exec(this.currentText), i) as string; }

  eachChar(f: (currentChar: string, currentIndex: number) => boolean): void {
    for(this.curIndex = 0; this.curIndex < this.lineLength; this.curIndex++) {
      const shouldReset: boolean = f(this.currentChar, this.currentIndex);
      if(shouldReset) { this.resetCurrentText(); }
    }
  }
  cleanup(): void {
    if(this.hasText) {
      this.addPiece(this.currentText);
      this.resetCurrentText();
    }
  }
  mapPieces<T>(f: (text: string, type: string | null, trimmedText: string, piece: Piece) => T): T[] {
    return _map(this.pieces, (p: Piece) => f(p.text, p.type, p.text.trim(), p));
  }
}
