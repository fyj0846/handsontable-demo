import {UPDATE_TO_DATE, FORMULA_PREFIX} from '../config'
import { stat } from 'fs';

export default class FormulaMapper {
    // mapper保存物理横纵坐标，即soureData,不受过滤，排序影响，应用场合中需要转换
    constructor (row, column, rawValue, value, status = UPDATE_TO_DATE) {
        this.row = row;
        this.column = column;
        this.rawValue = rawValue;
        this.value = value;
    }

    get value () {
        return this._value
    }

    set value (newValue) {
        this._value = newValue
    }

    get rawValue () {
        return this._rawValue
    }

    set rawValue (rawValue) {
        this._rawValue = rawValue
    }

    isFormula () {
        if(this.rawValue && this.rawValue.startsWith(FORMULA_PREFIX)) {
            return true
        } else {
            return false
        }
    }

    update(row, column, rawValue, value) {
        if(row != null) {
            this.row = row
        }
        if(column != null) {
            this.column = column
        }
        if(rawValue != null) {
            this.rawValue = rawValue
        }
        if(value != null) {
            this.value = value
        }
    }

    isEqual(row, column) {
        if(this.row == row && this.column == column) {
            return true
        } else {
            return false
        }
    }
}