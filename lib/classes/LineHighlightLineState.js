const _map = require('lodash/map');
import { getItem, empty, asArray } from './helpers';

function makePiece(text, type) {
    return {
        text: asArray(text).join(''),
        type
    };
}

export class LineHighlightLineState {
    constructor(line) {
        this._line = line;
        this._currentIndex = -1;
        this._chars = line.split('');
        this._currentText = '';
        this._pieces = [];
    }

    get line() { return this._line; }
    get lineLength() { return this.line.length; }
    get chars() { return this._chars; }
    get currentText() { return this._currentText; }
    get hasText() { return !empty(this.currentText); }
    get pieces() { return this._pieces; }
    get pieceCount() { return this.pieces.length; }
    get hasPieces() { return this.pieceCount > 0; }
    get currentIndex() { return this._currentIndex; }
    get currentChar() { return this.chars[this.currentIndex]; }
    get nextChar() { return this.chars[this.currentIndex + 1]; }
    get atEnd() { return this.currentIndex >= this.lineLength - 1; }
    get remainingChars() { return this.chars.slice(this.currentIndex + 1); }
    get remainingText() { return this.remainingChars.join(''); }
    get newText() { return this.currentText + this.currentChar; }
    addChar() { this._currentText += this.currentChar; }
    addPiece(text, type = null) { this._pieces.push(makePiece(text, type)); }
    setPiece(index, text, type = null) { this._pieces[index] = makePiece(text, type); }
    resetPieces() { this._pieces = []; }
    resetCurrentText() { this._currentText = ''; }
    currentTextMatches(r) { return r.test(this.currentText); }
    newTextMatches(r) { return r.test(this.newText); }
    onChar(...chars) { return chars.includes(this.currentChar); }
    remainingTextMatches(r) { return r.test(this.remainingText); }
    textPart(r, i) { return getItem(r.exec(this.currentText), i); }
    eachChar(f) {
        for(this._currentIndex = 0; this._currentIndex < this.lineLength; this._currentIndex++) {
            let shouldReset = f(this.currentChar, this.currentIndex);
            if(shouldReset) { this.resetCurrentText(); }
        }
    }
    cleanup() {
        if(this.hasText) {
            this.addPiece(this.currentText);
            this.resetCurrentText();
        }
    }
    mapPieces(f) {
        return _map(this.pieces, p => f(p.text, p.type, p.text.trim(), p));
    }
}