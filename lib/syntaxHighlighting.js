const _map = require('lodash/map');
const _each = require('lodash/each');
const queryString = require('query-string');
import { empty } from './classes/helpers';
import { LineHighlightState } from './classes/LineHighlightState'

function highlightLine(line, colors) {
    let s = new LineHighlightState(line);
    s.eachChar(c => {
        if(!s.hasText) {
            s.addChar();
            return false;
        }
        if(s.onChar(':') && s.currentTextMatches(/\S$/)) {
            s.addPiece(s.currentText, 'label');
            s.addPiece(c, 'colon');
            return true;
        }
        if(s.onChar('=') && s.currentTextMatches(/\S$/) && !s.currentTextMatches(/^[\s=]*$/) && s.nextChar == ' ') {
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
    let parts = s.mapPieces((text, type, trimmedText) => {
        let color = colors[text] || colors[trimmedText];
        let extra = (type == 'label' && color) ? `style="color: ${color};"` : '';
        return type ? `<span class="hl hl-${type}"${extra}>${text}</span>` : text;
    });
    return parts.join('');
}

const cleanedColorPattern = /^#([\da-f]{3}|[\da-f]{6})$/;

export function updateColors() {
    let colorStr = window.localStorage.getItem('colors') || '';
    let colors = {};
    _each(colorStr.split(/\|/g), p => {
        let parts = p.split(/=/);
        if(parts && parts.length == 2 && !empty(parts[0]) && parts[1] && cleanedColorPattern.test(parts[1])) {
            colors[parts[0]] = parts[1];
        }
    });
    const parsed = queryString.parse(window.location.search);
    _each(Object.keys(parsed), k => {
        let color = parsed[k];
        if(/^#?([\da-f]{3}|[\da-f]{6})$/i.test(color)) {
            if(!/^#/.test(color)) { color = `#${color}`; }
            colors[k] = color.toLowerCase();
        } else {
            colors[k] = null;
        }
    });
    let colorArr = [];
    _each(Object.keys(colors), k => {
        if(!empty(k) && colors[k] && cleanedColorPattern.test(colors[k])) {
            colorArr.push(`${k}=${colors[k]}`);
        }
    });
    window.localStorage.setItem('colors', colorArr.join('|'));
    return colors;
}

export function highlightSyntax(lines, colors) {
    return _map(lines, line => highlightLine(line, colors));
}