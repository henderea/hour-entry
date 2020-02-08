const _map = require('lodash/map');
const _isNil = require('lodash/isNil');
const _compact = require('lodash/compact');
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

function asArray(a) {
    return Array.isArray(a) ? a : [a];
}

function getItem(a, i) {
    return a && a[i];
}

function empty(s) {
    return !s || s.length <= 0;
}

function cleanLabels(labels) {
    return _compact(_map(labels, l => !empty(l) && /\S/.test(l) && l.trim()))
}

export {
    moment,
    formatTime,
    appendTotal,
    determineIndex,
    ensureMoment,
    asArray,
    getItem,
    empty,
    cleanLabels
};