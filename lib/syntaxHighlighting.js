const _map = require('lodash/map');
import { HighlightRules } from './classes/HighlightRules';

const highlightRules = new HighlightRules()
    .addRule(/([^:]+)(:\s*)/g, ['label', 'colon'])
    .addRule(/(\d+(?:\.\d+)?|\.\d+)([hm\s]+)(?=\s*(?:\d+(?:\.\d+)?|\.\d+)[hm\s]*$)/g, ['value', 'unit'])
    .addRule(/(\d+(?:\.\d+)?|\.\d+)([hm\s]+)?$/g, ['value', 'unit']);

export function highlightSyntax(lines) {
    return _map(lines, line => highlightRules.applyRules(line));
}