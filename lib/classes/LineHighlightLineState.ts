import _map from 'lodash/map.js';
import { getItem, empty, asArray } from './helpers';

export type Piece = { text: string, type: string | null };

function makePiece(text: string | string[], type: string | null): Piece {
  return {
    text: asArray(text).join(''),
    type
  };
}

export class LineHighlightLineState {
  private readonly _line: string;
  private _currentIndex: number;
  private _chars: string[];
  private _currentText: string;
  private _pieces: Piece[];

  constructor(line: string) {
    this._line = line;
    this._currentIndex = -1;
    this._chars = line.split('');
    this._currentText = '';
    this._pieces = [];
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
  get currentChar(): string { return this.chars[this.currentIndex]; }
  get nextChar(): string { return this.chars[this.currentIndex + 1]; }
  get atEnd(): boolean { return this.currentIndex >= this.lineLength - 1; }
  get remainingChars(): string[] { return this.chars.slice(this.currentIndex + 1); }
  get remainingText(): string { return this.remainingChars.join(''); }
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
  textPart(r: RegExp, i: number): string { return getItem(r.exec(this.currentText), i) as string; }
  eachChar(f: (currentChar: string, currentIndex: number) => boolean): void {
    for(this._currentIndex = 0; this._currentIndex < this.lineLength; this._currentIndex++) {
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
