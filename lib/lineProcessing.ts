import type { GroupEntry } from './classes/GroupEntry';
import type { RangeEntry } from './classes/RangeEntry';
import type { LineEntry } from './classes/LineEntry';
import type { LabelEntry } from './classes/LabelEntry';

import _isNaN from 'lodash/isNaN.js';
import _each from 'lodash/each.js';
import _sumBy from 'lodash/sumBy.js';
import { State } from './classes/State';

const rangeRegex: RegExp = /^(?:[=+|]\s)?((?:[^=:]+[=:]\s*)*)(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4}):\s*$/;
const dateRegex: RegExp = /(\d{1,2}\/\d{1,2}\/\d{4}):/;

function processTitleLine(state: State): void {
  if(state.currentGroup) {
    const titleLine: string = state.getLine(state.currentGroup);
    processDateLine(titleLine, state.currentTotal, state);
    state.appendTotal(state.currentGroup, state.currentTotal);
  }
}

function processDateLine(line: string, value: number, state: State): void {
  if(dateRegex.test(line)) {
    const m: RegExpExecArray = dateRegex.exec(line) as RegExpExecArray;
    state.addDateEntry(m[1], value);
  }
}

const hourOrMinutePattern: RegExp = /^.*:\s*(\d+(?:\.\d+)?|\.\d+)\s*([hm])?\s*$/;
const hourAndMinutePattern: RegExp = /^.*:\s*(\d+(?:\.\d+)?|\.\d+)\s*h\s*(\d+(?:\.\d+)?|\.\d+)\s*m?\s*$/;

function processEntry(line: string, state: State): void {
  let minutes: number = NaN;
  if(hourOrMinutePattern.test(line)) {
    const m: RegExpExecArray = hourOrMinutePattern.exec(line) as RegExpExecArray;
    const value: number = parseFloat(m[1]);
    const unit: string = m[2] || 'h';
    minutes = value * (unit === 'h' ? 60 : 1);
  } else if(hourAndMinutePattern.test(line)) {
    const m: RegExpExecArray = hourAndMinutePattern.exec(line) as RegExpExecArray;
    const hourValue: number = parseFloat(m[1]);
    const minuteValue: number = parseFloat(m[2]);
    minutes = hourValue * 60 + minuteValue;
  }
  minutes = Math.round(minutes);
  if(!_isNaN(minutes)) {
    state.addToTotal(minutes);
    processDateLine(line, minutes, state);
    state.addRowEntry(line, minutes, state.currentGroup as GroupEntry);
  }
}

function processRanges(state: State): void {
  _each(state.ranges, (range: RangeEntry) => {
    if(!range.labels || range.labels.length <= 0) {
      state.appendRangeTotal(range);
    } else {
      const total: number = _sumBy(state.rows, (row: LineEntry) => {
        if(row.matchesAllLabels(range.labels) && row.in(range)) {
          return row.value;
        }
        return 0;
      });
      state.appendTotal(range, total);
    }
  });
}

function processLabelRows(state: State): void {
  _each(state.labelRows, (labelRow: LabelEntry) => {
    const total: number = _sumBy(state.rows, (row: LineEntry) => {
      if(row.matchesAllLabels(labelRow.labels)) {
        return row.value;
      }
      return 0;
    });
    state.appendTotal(labelRow, total);
  });
}

export function processLines(lines: string[]): string[] {
  const state = new State(lines);
  _each(state.lines, (line: string, lineNumber: number) => {
    if(rangeRegex.test(line)) {
      const m: RegExpExecArray = rangeRegex.exec(line) as RegExpExecArray;
      state.addRangeEntry(m[1], m[2], m[3], lineNumber);
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
