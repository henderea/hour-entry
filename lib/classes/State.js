const _concat = require('lodash/concat');
const _reduce = require('lodash/reduce');
import { appendTotal, determineIndex } from './helpers';
import { DateEntry } from './DateEntry';
import { RangeEntry } from './RangeEntry';

export class State {
    constructor(lines) {
        this._lines = _concat([], lines);
        this._titleLineIndex = -1;
        this._currentTotal = 0;
        this._dates = [];
        this._ranges = [];
    }

    get lines() { return this._lines; }
    get titleLineIndex() { return this._titleLineIndex; }
    set titleLineIndex(value) { this._titleLineIndex = value; }
    get currentTotal() { return this._currentTotal; }
    set currentTotal(value) { this._currentTotal = value; }
    get dates() { return this._dates; }
    get ranges() { return this._ranges; }

    getLine(index) { return this.lines[determineIndex(index)]; }
    setLine(index, value) { this.lines[determineIndex(index)] = value; }

    appendTotal(index, total) { this.setLine(index, appendTotal(this.getLine(index), total)); }
    appendRangeTotal(range) { this.appendTotal(range, this.getRangeTotal(range)); }

    addRange(range) { this.ranges.push(range); }
    addRangeEntry(startDate, endDate, lineNumber) { this.addRange(new RangeEntry(startDate, endDate, lineNumber)); }
    addDate(date) { this.dates.push(date); }
    addDateEntry(date, value) { this.addDate(new DateEntry(date, value)); }

    getRangeTotal(range) { return _reduce(this.dates, (total, date) => total + date.valueIn(range), 0); }

    addToTotal(value) { this.currentTotal += value; }

    reset() {
        this.titleLineIndex = -1;
        this.currentTotal = 0;
    }
}