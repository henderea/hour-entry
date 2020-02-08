import { cleanLabels } from './helpers';

export class GroupEntry {
    constructor(line, lineNumber) {
        this._line = line;
        this._labels = cleanLabels(line.split(/[=:]/g));
        this._lineNumber = lineNumber;
    }

    get line() { return this._line; }
    get labels() { return this._labels; }
    get lineNumber() { return this._lineNumber; }
}