import { moment, ensureMoment } from './helpers';

export class RangeEntry {
    constructor(startDate, endDate, lineNumber) {
        this._range = moment.range(ensureMoment(startDate), ensureMoment(endDate));
        this._lineNumber = lineNumber;
    }

    get range() { return this._range; }
    get lineNumber() { return this._lineNumber; }

    contains(date) { return this.range.contains(ensureMoment(date)); }
}