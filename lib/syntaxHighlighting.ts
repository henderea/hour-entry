import type { LineHighlightLineState } from './classes/LineHighlightLineState';

import _each from 'lodash/each.js';
import queryString  from 'query-string';
import { empty } from './classes/helpers';
import { LineHighlightState } from './classes/LineHighlightState';

function processLine(s: LineHighlightLineState, state: LineHighlightState) {
  s.eachChar((c: string) => {
    if(!s.hasText) {
      s.addChar();
      return false;
    }
    if(
      state.boxCompatible(1) && s.onChar(' ') && !s.hasPieces && s.currentTextMatches(/^=$/) && !s.remainingTextMatches(/^=*\s*$/) && !state.atStart && !state.atEnd &&
            (/^\s*$/.test(state.previousLine) || (state.previousLineState.hasPieces && /^(=\s|=*\s*$)/.test(state.previousLineState.pieces[0].text))) &&
            (/^=*\s*$/.test(state.nextLine) || /^=\s/.test(state.nextLine))
    ) {
      s.addPiece(s.currentText + c, 'box');
      if(state.boxStart < 0) {
        state.boxStart = state.currentIndex - 1;
        state.boxType = 1;
      }
      return true;
    }
    if(
      state.boxCompatible(2) && s.onChar(' ') && !s.hasPieces && s.currentTextMatches(/^[+|]$/) && !s.remainingTextMatches(/^[+|]*-*\s*$/) && !state.atStart && !state.atEnd &&
            (/^\s*$/.test(state.previousLine) || (state.previousLineState.hasPieces && /^([+|]\s|[+|]+-*[+|]*\s*$|\s*$)/.test(state.previousLineState.pieces[0].text))) &&
            (/^([+|]+-*[+|]*\s*|\s*)$/.test(state.nextLine) || /^[+|]\s/.test(state.nextLine))
    ) {
      s.addPiece(s.currentText + c, 'box2');
      if(state.boxStart < 0) {
        state.boxStart = state.currentIndex - 1;
        state.boxType = 2;
      }
      return true;
    }
    if(s.onChar(':') && s.currentTextMatches(/\S$/)) {
      s.addPiece(s.currentText, 'label');
      s.addPiece(c, 'colon');
      return true;
    }
    if(s.onChar('=') && s.currentTextMatches(/\S$/) && !s.currentTextMatches(/^[\s=]*$/) && s.nextChar === ' ') {
      s.addPiece(s.currentText, 'label');
      s.addPiece(c, 'colon');
      return true;
    }
    if(s.onChar(' ') && s.currentTextMatches(/\s+-$/)) {
      const m: RegExpExecArray = /^(.*?)(\s+-)/.exec(s.currentText) as RegExpExecArray;
      s.addPiece(m[1], 'label');
      s.addPiece(m[2] + c, 'colon');
      return true;
    }
    if(s.onChar('h', 'm') && s.currentTextMatches(/^\s*(\d+(\.\d+)?|\.\d+)$/) && s.remainingTextMatches(/^\s*((\d+(\.\d*)?|\.\d*)m?)?\s*$/)) {
      s.addPiece(s.currentText, 'value');
      s.addPiece(c, 'unit');
      return true;
    }
    if(s.atEnd && s.newTextMatches(/^\s*(\d+(\.\d*)?|\.\d*)\s*$/)) {
      s.addPiece(s.newText, 'value');
      return true;
    }
    s.addChar();
    return false;
  });
  s.cleanup();
  if(state.boxStart >= 0 && (state.boxType === 1 ? /^=*\s*$/ : /^([+|]+-*[+|]*\s*|\s*)$/).test(s.line) && (state.atEnd || !(state.boxType === 1 ? /^=+\s*/ : /^[+|]+-*[+|]*\s*/).test(state.nextLine))) {
    state.processBox();
  } else if((state.boxType === 1 && !(/^=*\s*$/.test(s.line) || /^=\s/.test(s.line))) || (state.boxType === 2 && !(/^([+|]+-*[+|]*\s*|\s*)$/.test(s.line) || /^[+|]\s/.test(s.line)))) {
    state.boxStart = -1;
  }
}

function lineStateFormatter(s: LineHighlightLineState, colors: Dictionary<string | null>): string {
  const parts: string[] = s.mapPieces((text: string, type: string | null, trimmedText: string) => {
    const color: string | null = colors[text] || colors[trimmedText];
    const extra: string = (type === 'label' && color) ? `style="color: ${color};"` : '';
    return type ? `<span class="hl hl-${type}"${extra}>${text}</span>` : text;
  });
  return parts.join('');
}

const cleanedColorPattern: RegExp = /^#([\da-f]{3}|[\da-f]{6})$/;

export function updateColors(): Dictionary<string | null> {
  const colorStr: string = window.localStorage.getItem('colors') || '';
  const colors: Dictionary<string | null> = {};
  _each(colorStr.split(/\|/g), (p: string) => {
    const parts: string[] = p.split(/=/);
    if(parts && parts.length === 2 && !empty(parts[0]) && parts[1] && cleanedColorPattern.test(parts[1])) {
      colors[parts[0]] = parts[1];
    }
  });
  const parsed: queryString.ParsedQuery = queryString.parse(window.location.search);
  _each(Object.keys(parsed), (k: string) => {
    let color: string = decodeURIComponent(parsed[k] as string);
    const key: string = decodeURIComponent(k);
    if(/^#?([\da-f]{3}|[\da-f]{6})$/i.test(color)) {
      if(!/^#/.test(color)) { color = `#${color}`; }
      colors[key] = color.toLowerCase();
    } else {
      colors[key] = null;
    }
  });
  const colorArr: string[] = [];
  _each(Object.keys(colors), (k) => {
    if(!empty(k) && colors[k] && cleanedColorPattern.test(colors[k] as string)) {
      colorArr.push(`${k}=${colors[k]}`);
    }
  });
  window.localStorage.setItem('colors', colorArr.join('|'));
  return colors;
}

export function highlightSyntax(lines: string[], colors: Dictionary<string | null>) {
  return new LineHighlightState(lines, colors, lineStateFormatter).processLines(processLine);
}
