const _concat = require('lodash/concat');
const _join = require('lodash/join');
const _map = require('lodash/map');
const _isNil = require('lodash/isNil');
const moment = require('moment');
require('moment-range').extendMoment(moment);

function formatTime(mins) {
    if(mins < 60) {
        return `${mins}m`;
    }
    if(mins % 60 == 0) {
        return `${Math.floor(mins / 60)}h`;
    }
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function appendTotal(line, total) {
    const formattedTotal = formatTime(total);
    if(/\s+$/.test(line)) {
        return `${line}${formattedTotal}`;
    } else {
        return `${line} ${formattedTotal}`;
    }
}

function determineIndex(index) {
    if(!_isNil(index.lineNumber)) { return index.lineNumber; }
    return index;
}

function ensureMoment(m) {
    if(moment.isMoment(m)) { return m; }
    return moment(m, 'MM/DD/YYYY');
}

function makeHighlightSpan(element, index) {
    let classes = _concat(['hl'], element);
    return `<span class="${_join(_map(classes, c => /^hl/.test(c) ? c : `hl-${c}`), ' ')}">$${index + 1}</span>`;
}

export {
    moment,
    formatTime,
    appendTotal,
    determineIndex,
    ensureMoment,
    makeHighlightSpan
};