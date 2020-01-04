const _ = require('lodash');

class HighlightRule {
    constructor(pattern, elements) {
        this._pattern = pattern;
        this._elements = elements;
        this._subs = _.join(_.map(elements, (e, i) => makeHighlightSpan(e, i)), '');
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

const highlightRules = [
    new HighlightRule(/([^:]+)(:\s*)/g, ['hl-label', 'hl-colon']),
    new HighlightRule(/(\d+(?:\.\d+)?|\.\d+)([hm\s]+)(?=\s*(?:\d+(?:\.\d+)?|\.\d+)[hm\s]*)$/g, ['hl-value, hl-unit']),
    new HighlightRule(/(\d+(?:\.\d+)?|\.\d+)([hm\s]+)?$/g, ['hl-value', 'hl-unit'])
];

function makeHighlightSpan(element, index) {
    let classes = _.concat(['hl'], element);
    return `<span class="${_.join(classes, ' ')}">$${index + 1}</span>`;
}

export function highlightSyntax(lines) {
    return _.map(lines, line => _.reduce(highlightRules, (l, rule) => rule.apply(l), line));
}