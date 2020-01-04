const _reduce = require('lodash/reduce');
import { HighlightRule } from './HighlightRule';

export class HighlightRules {
    constructor() {
        this._rules = [];
    }

    get rules() { return this._rules; }

    add(rule) { this.rules.push(rule); return this; }
    addRule(pattern, elements) { return this.add(new HighlightRule(pattern, elements)); }

    applyRules(line) { return _reduce(this.rules, (l, rule) => rule.apply(l), line); }
}