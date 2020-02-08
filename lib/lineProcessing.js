const _isNaN = require('lodash/isNaN');
const _each = require('lodash/each');
const _sumBy = require('lodash/sumBy');
import { State } from './classes/State';

const rangeRegex = /^(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4}):\s*$/;
const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}):/;

function processTitleLine(state) {
    if(state.currentGroup) {
        let titleLine = state.getLine(state.currentGroup);
        processDateLine(titleLine, state.currentTotal, state);
        state.appendTotal(state.currentGroup, state.currentTotal);
    }
}

function processDateLine(line, value, state) {
    if(dateRegex.test(line)) {
        let m = dateRegex.exec(line);
        state.addDateEntry(m[1], value);
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
    if(!_isNaN(minutes)) {
        state.addToTotal(minutes);
        processDateLine(line, minutes, state);
        state.addRowEntry(line, minutes, state.currentGroup);
    }
}

function processRanges(state) {
    _each(state.ranges, range => state.appendRangeTotal(range));
}

function processLabelRows(state) {
    _each(state.labelRows, labelRow => {
        let total = _sumBy(state.rows, row => {
            if(row.matchesAllLabels(labelRow.labels)) {
                return row.value;
            }
            return 0;
        });
        state.appendTotal(labelRow, total);
    });
}

export function processLines(lines) {
    const state = new State(lines);
    _each(state.lines, (line, lineNumber) => {
        if(rangeRegex.test(line)) {
            let m = rangeRegex.exec(line);
            state.addRangeEntry(m[1], m[2], lineNumber);
        } else if(/^.*:\s*$/.test(line) && !state.currentGroup) {
            state.currentGroup = state.addGroupEntry(line, lineNumber);
        } else if(/^.*=\s*$/.test(line) && !/^[\s=]*=\s*$/.test(line)) {
            state.addLabelRowEntry(line, lineNumber);
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
    processLabelRows(state);
    return state.lines;
}