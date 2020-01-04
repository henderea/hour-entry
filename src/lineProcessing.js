const _ = require('lodash');
const moment = require('moment');
require('moment-range').extendMoment(moment);

class State {
    constructor(lines) {
        this._lines = _.concat([], lines);
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
    addDate(date) { this.dates.push(date); }

    getRangeTotal(range) { return _.reduce(this.dates, (total, date) => total + date.valueIn(range), 0); }

    addToTotal(value) { this.currentTotal += value; }

    reset() {
        this.titleLineIndex = -1;
        this.currentTotal = 0;
    }
}

class RangeEntry {
    constructor(startDate, endDate, lineNumber) {
        this._range = moment.range(ensureMoment(startDate), ensureMoment(endDate));
        this._lineNumber = lineNumber;
    }

    get range() { return this._range; }
    get lineNumber() { return this._lineNumber; }

    contains(date) { return this.range.contains(ensureMoment(date)); }
}

class DateEntry {
    constructor(date, value) {
        this._date = ensureMoment(date);
        this._value = value;
    }

    get date() { return this._date; }
    get value() { return this._value; }

    in(range) { return range.contains(this.date); }
    valueIn(range) { return this.in(range) ? this.value : 0; }
}

function formatTime(mins) {
    if(mins < 60) {
        return `${mins}m`;
    }
    if(mins % 60 == 0) {
        return `${Math.floor(mins / 60)}h`;
    }
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const rangeRegex = /^(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4}):\s*$/;
const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}):/;

function processTitleLine(state) {
    if(state.titleLineIndex >= 0) {
        let titleLine = state.getLine(state.titleLineIndex);
        processDateLine(titleLine, state.currentTotal, state);
        state.appendTotal(state.titleLineIndex, state.currentTotal);
    }
}

function appendTotal(line, total) {
    const formattedTotal = formatTime(total);
    if(/\s+$/.test(line)) {
        return `${line}${formattedTotal}`;
    } else {
        return `${line} ${formattedTotal}`;
    }
}

function processDateLine(line, value, state) {
    if(dateRegex.test(line)) {
        let m = dateRegex.exec(line);
        state.addDate(new DateEntry(m[1], value));
    }
}

const hourOrMinutePattern = /^.*:\s*(\d+(?:\.\d+)?|\.\d+)\s*(h|m)?\s*$/;
const hourAndMinutePattern = /^.*:\s*(\d+(?:\.\d+)?|\.\d+)\s*h\s*(\d+(?:\.\d+)?|\.\d+)\s*m?\s*$/;

function processEntry(line, state) {
    let minutes;
    if(hourOrMinutePattern.test(line)) {
        let m = hourOrMinutePattern.exec(line);
        let value = parseFloat(m[1]);
        let unit = m[2] || 'h';
        minutes = value * (unit == 'h' ? 60 : 1);
    } else if(hourAndMinutePattern.test(line)) {
        let m = hourAndMinutePattern.exec(line);
        let hourValue = parseFloat(m[1]);
        let minuteValue = parseFloat(m[2]);
        minutes = hourValue * 60 + minuteValue;
    }
    minutes = Math.round(minutes);
    if(!_.isNaN(minutes)) {
        state.addToTotal(minutes);
        processDateLine(line, minutes, state);
    }
}

function determineIndex(index) {
    if(index instanceof RangeEntry) { return index.lineNumber; }
    return index;
}

function ensureMoment(m) {
    if(moment.isMoment(m)) { return m; }
    return moment(m, 'MM/DD/YYYY');
}

function processRanges(state) {
    _.each(state.ranges, range => state.appendRangeTotal(range));
}

export function processLines(lines) {
    const state = new State(lines);
    _.each(state.lines, (line, lineNumber) => {
        if(rangeRegex.test(line)) {
            let m = rangeRegex.exec(line);
            state.addRange(new RangeEntry(m[1], m[2], lineNumber));
        } else if(/^.*:\s*$/.test(line) && state.titleLineIndex < 0) {
            state.titleLineIndex = lineNumber;
        } else if(/^\s*$/.test(line)) {
            processTitleLine(state);
            state.reset();
        } else {
            processEntry(line, state);
        }
    });
    processTitleLine(state);
    state.reset();
    processRanges(state);
    return state.lines;
}