const _map = require('lodash/map');
import { HighlightRules } from './classes/HighlightRules';

const highlightRules = new HighlightRules()
    .addQueryStringLabelRules()
    .addRule(/(^\s*|:\s+|:\s*<\/span>\s*|\s+-\s+|-\s*<\/span>\s*)([^:><]+)(:\s+|:$|\s+-\s+)/g, [null, 'label', 'colon'])
    .addRule(/(\d+(?:\.\d+)?|\.\d+)([hm\s]+)(?=\s*(?:\d+(?:\.\d+)?|\.\d+)[hm\s]*$)/g, ['value', 'unit'])
    .addRule(/(\d+(?:\.\d+)?|\.\d+)([hm\s]+)?$/g, ['value', 'unit'])
    .addRawRule(/color="#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})"/g, 'style="color: #$1;"');

export function highlightSyntax(lines) {
    return _map(lines, line => highlightRules.applyRules(line));
}