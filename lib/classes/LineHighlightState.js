import _map from 'lodash/map.js';
import { LineHighlightLineState } from './LineHighlightLineState'

export class LineHighlightState {
    constructor(lines, colors, lineStateFormatter) {
        this._lines = lines;
        this._colors = colors;
        this._currentIndex = -1;
        this._lineStates = _map(lines, l => new LineHighlightLineState(l));
        this._lineStateFormatter = lineStateFormatter;
        this._boxStart = -1;
        this._boxType = 0;
    }

    get lines() { return this._lines; }
    get lineCount() { return this.lines.length; }
    get colors() { return this._colors; }
    get currentIndex() { return this._currentIndex; }
    get currentLine() { return this.lines[this.currentIndex]; }
    get previousLine() { return this.lines[this.currentIndex - 1]; }
    get nextLine() { return this.lines[this.currentIndex + 1]; }
    get lineStates() { return this._lineStates; }
    get currentLineState() { return this.lineStates[this.currentIndex]; }
    get previousLineState() { return this.lineStates[this.currentIndex - 1]; }
    get nextLineState() { return this.lineStates[this.currentIndex + 1]; }
    get atStart() { return this.currentIndex <= 0; }
    get atEnd() { return this.currentIndex >= this.lineCount - 1; }
    get boxStart() { return this._boxStart; }
    set boxStart(value) { this._boxStart = value; }
    get boxType() { return this._boxType; }
    set boxType(value) { this._boxType = value; }
    get lineStateFormatter() { return this._lineStateFormatter; }
    get outputLines() { return _map(this.lineStates, s => this.lineStateFormatter(s, this.colors, this)); }
    boxCompatible(type) { return this.boxType === 0 || this.boxType === type; }
    processBox() {
        if(this.boxType !== 1 && this.boxType !== 2) {
            this.boxStart = -1;
            return;
        }
        let maxLength = 0;
        let i;
        for(i = this.boxStart; i <= this.currentIndex; i++) {
            let length = this.lines[i].length;
            if(length > maxLength) {
                maxLength = length;
            }
        }
        for(i = this.boxStart; i <= this.currentIndex; i++) {
            let s = this.lineStates[i];
            let l = this.lines[i];
            if((this.boxType === 1 ? /^=*\s*$/ : /^([+|]+-*[+|]*\s*|\s*)$/).test(l)) {
                s.resetPieces();
                if(this.boxType === 1) {
                    s.addPiece('='.repeat(maxLength + 2), 'box');
                } else if(this.boxType === 2) {
                    s.addPiece(`+${'-'.repeat(maxLength)}+`, 'box2')
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
    processLines(f) {
        for(this._currentIndex = 0; this._currentIndex < this.lineCount; this._currentIndex++) {
            f(this.currentLineState, this);
        }
        return this.outputLines;
    }
}