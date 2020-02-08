const _difference = require('lodash/difference');
import { cleanLabels, empty } from './helpers';

export class LineEntry {
    constructor(line, value, group) {
        this._line = line;
        this._labels = cleanLabels(line.split(/[=:]/g));
        this._value = value;
        this._group = group;
    }

    get line() { return this._line; }
    get labels() { return this._labels; }
    get value() { return this._value; }
    get group() { return this._group; }

    matchesAllLabels(labels) {
        let unmatchedLabels = cleanLabels(labels);
        unmatchedLabels = _difference(unmatchedLabels, this.labels);
        if(!empty(unmatchedLabels) && this.group && !empty(this.group.labels)) {
            unmatchedLabels = _difference(unmatchedLabels, this.group.labels);
        }
        return empty(unmatchedLabels);
    }
}