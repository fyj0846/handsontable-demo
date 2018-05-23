import FormulaMapper from './FormulaMapper'
import Change from './Change'
import {FORMULA_CELL_REG, OUT_OF_DATE, UPDATE_TO_DATE} from '../config'
import {updateColumnLabel} from '../cellTools'

export default class FormulaMapperList {
    constructor () {
        this.list = []
    }

    clearList () {
        this.list = []
    }

    add(mapper) {
        if(this.list) {
            this.list.push(mapper)
        } else {
            console.log('FormulaMapperList未被实例化，请检查')
        }
    }

    remove(target) {
        var row = target.row
        var column = target.getColumn;
        var index = this.list.findIndex(function(mapper) {
            if(mapper.isEqual(row, column)) {
                return true
            }
        })
        if(index) {
            this.list.splice(index, 1)
        }
    }

    isExist(row, column) {
        var result = this.list.find(function(mapper) {
            if(mapper.isEqual(row, column)) {
                return true;
            }
        })
        return result
    }

    getMapperByCoord(row, column) {
        var result = this.list.find(function(mapper) {
            if(mapper.isEqual(row, column)) {
                return mapper;
            }
        })
        return result
    }

    updateMapperByChange(change, result) {
        var row = change.row;
        var column = change.column;
        var newValue = change.newValue;

        var target = this.list.find(function(mapper) {
            if(mapper.isEqual(row, column)) {
                return true
            }
        })

        if(target) {
            //找到对应元素
            if(target.rawValue != newValue || target.value != result) {
                console.log("remove mapper: (", row , ".",column, ") ->", target.rawValue, ' : ', target.value)
                this.remove(target);
                console.log("add mapper [new]: (", row, ",", column, ") ->", newValue, ' : ', result)
                this.add(new FormulaMapper(row, column, newValue, result))
            }
        } else {
            //未找到对应元素
            console.log("add mapper [new]: (", row, ",", column, ") ->", newValue, ' : ', result)
            this.add(new FormulaMapper(row, column, newValue, result))
        }
        
    }

    adjustMapperListForColomn(startColumn, amount) {
        var changeList = [];
        this.list.forEach(function (mapper) {
            // 疑似有bug：
            // 引用公式的单元格在变更col的右侧，但不代表其引用的公式在col的右侧（即不一定需要调整）
            if(mapper.column >= startColumn) {
                if(mapper.isFormula()) {
                    var formula = mapper.rawValue;
                    var newFormula = formula.replace(FORMULA_CELL_REG, function(match, p1, offset) {
                        return updateColumnLabel(match, amount);
                    })
                }
                console.log('update formula: (', mapper.row, '.', mapper.column, ') ', formula, "->", newFormula)
                var origValue = mapper.rawValue;
                mapper.update(mapper.row, Math.max(mapper.column + amount, 0), newFormula, newFormula, OUT_OF_DATE)
                changeList.push(new Change(mapper.row, mapper.column, origValue, newFormula))
            }
        });
        return changeList;
    }

    syncOutOfDateMappersToTable(callback, source) {
        if(typeof callback != 'function') {
            console.log("未传入回调函数，请检查")
            return;
        }
        this.list.forEach(function(mapper) {
            if(mapper.status != UPDATE_TO_DATE) {
                callback(mapper.row, mapper.column, mapper.rawValue, source)
                mapper.status = UPDATE_TO_DATE
            }
        })
    }
}