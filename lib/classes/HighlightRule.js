const _join = require('lodash/join');
const _map = require('lodash/map');
import { makeHighlightSpan } from './helpers';

export class HighlightRule {
    constructor(pattern, elements) {
        this._pattern = pattern;
        this._elements = elements;
        this._subs = _join(_map(elements, (e, i) => makeHighlightSpan(e, i)), '');
    }

    get pattern() {
        return this._pattern;
    }

    get elements() {
        return this._elements;
    }

    get subs() {
        return this._subs;
    }

    apply(line) {
        return line.replace(this.pattern, this.subs);
    }
}

export class RawHighlightRule {
    constructor(pattern, subs) {
        this._pattern = pattern;
        this._subs = subs;
    }

    get pattern() {
        return this._pattern;
    }

    get subs() {
        return this._subs;
    }

    apply(line) {
        return line.replace(this.pattern, this.subs);
    }
}