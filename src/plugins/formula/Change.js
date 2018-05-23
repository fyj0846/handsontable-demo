import {FORMULA_PREFIX} from '../config'
export default class Change {
    constructor (row, column, oldValue, newValue) {
        this.row = row;
        this.column = column;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    get row () {
        return this._row
    }

    set row (row) {
        this._row = row
    }

    get column () {
        return this._column
    }

    set column (column) {
        this._column = column
    }

    get oldValue () {
        return this._oldValue
    }

    set oldValue (oldValue) {
        this._oldValue = oldValue
    }

    get newValue () {
        return this._newValue
    }

    set newValue(newValue) {
        this._newValue = newValue
    }

    isFormula () {
        if(this.newValue && this.newValue.startsWith(FORMULA_PREFIX)) {
            return true
        } else {
            return false
        }
    }
}