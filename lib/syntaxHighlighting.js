import _each from 'lodash/each.js';
import queryString  from 'query-string';
import { empty } from './classes/helpers';
import { LineHighlightState } from './classes/LineHighlightState';

function processLine(s, state) {
  s.eachChar((c) => {
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
      s.addPiece(s.textPart(/^(.*?)(\s+-)/, 1), 'label');
      s.addPiece(s.textPart(/^(.*?)(\s+-)/, 2) + c, 'colon');
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

function lineStateFormatter(s, colors) {
  let parts = s.mapPieces((text, type, trimmedText, p) => {
    let color = colors[text] || colors[trimmedText];
    let extra = (type === 'label' && color) ? `style="color: ${color};"` : '';
    return type ? `<span class="hl hl-${type}"${extra}>${text}</span>` : text;
  });
  return parts.join('');
}

const cleanedColorPattern = /^#([\da-f]{3}|[\da-f]{6})$/;

export function updateColors() {
  let colorStr = window.localStorage.getItem('colors') || '';
  let colors = {};
  _each(colorStr.split(/\|/g), (p) => {
    let parts = p.split(/=/);
    if(parts && parts.length === 2 && !empty(parts[0]) && parts[1] && cleanedColorPattern.test(parts[1])) {
      colors[parts[0]] = parts[1];
    }
  });
  const parsed = queryString.parse(window.location.search);
  _each(Object.keys(parsed), (k) => {
    let color = decodeURIComponent(parsed[k]);
    let key = decodeURIComponent(k);
    if(/^#?([\da-f]{3}|[\da-f]{6})$/i.test(color)) {
      if(!/^#/.test(color)) { color = `#${color}`; }
      colors[key] = color.toLowerCase();
    } else {
      colors[key] = null;
    }
  });
  let colorArr = [];
  _each(Object.keys(colors), (k) => {
    if(!empty(k) && colors[k] && cleanedColorPattern.test(colors[k])) {
      colorArr.push(`${k}=${colors[k]}`);
    }
  });
  window.localStorage.setItem('colors', colorArr.join('|'));
  return colors;
}

export function highlightSyntax(lines, colors) {
  return new LineHighlightState(lines, colors, lineStateFormatter).processLines(processLine);
}
