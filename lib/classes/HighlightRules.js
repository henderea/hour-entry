const _reduce = require('lodash/reduce');
const _escapeRegExp = require('lodash/escapeRegExp');
const _each = require('lodash/each');
const _keys = require('lodash/keys');
const queryString = require('query-string');
import { HighlightRule, RawHighlightRule } from './HighlightRule';

export class HighlightRules {
    constructor() {
        this._rules = [];
    }

    get rules() { return this._rules; }

    add(rule) { this.rules.push(rule); return this; }
    addRule(pattern, elements) { return this.add(new HighlightRule(pattern, elements)); }
    addRawRule(pattern, subs) { return this.add(new RawHighlightRule(pattern, subs)); }
    addQueryStringLabelRules() {
        const parsed = queryString.parse(window.location.search);
        _each(_keys(parsed), k => {
            let color = parsed[k];
            if(/^#?([\da-f]{3}|[\da-f]{6})$/i.test(color)) {
                if(!/^#/.test(color)) { color = `#${color}`; }
                let pattern = new RegExp(`(^\\s*|:\\s+|:\\s*</span>\\s*|\\s+-\\s+|-\\s*</span>\\s*)(${_escapeRegExp(k)})(:\\s+|:$|\\s+-\\s+)`, 'g');
                let subs = `$1<span class="hl hl-label" color="${color}">$2</span><span class="hl hl-colon">$3</span>`;
                this.add(new RawHighlightRule(pattern, subs));
            }
        });
        return this;
    }

    applyRules(line) { return _reduce(this.rules, (l, rule) => rule.apply(l), line); }
}