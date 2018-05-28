import FormulaMapper from './FormulaMapper'
import Change from './Change'
import {FORMULA_CELL_REG, OUT_OF_DATE, UPDATE_TO_DATE} from '../config'
import {updateColumnLabel, updateRowLabel} from '../TableCell'

export default class FormulaMapperList {
    constructor (instance) {
        this.list = []  // table中包含的所有公式及其计算值，使用物理坐标
        this.mapperSaver = null  // 行变换前记录所有公式cell与可视坐标的映射，用户行变化后计算变换delta
        this.instance = instance
        this.toPhysicalRow = instance.hot.toPhysicalRow     // 提供可视坐标转换为物理坐标
        this.toPhysicalColumn = instance.hot.toPhysicalColumn
        this.toVisualRow = instance.hot.toVisualRow         // 提供物理坐标转换为可视坐标
        this.toVisualColumn = instance.hot.toVisualColumn
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
        var column = target.column;
        var index = this.list.findIndex(function(mapper) {
            if(mapper.isEqual(row, column)) {
                return true
            }
        })
        if(index != undefined) {
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
                console.log("remove mapper (physical): (", row , ".",column, ") ->", target.rawValue, ' : ', target.value)
                this.remove(target);
                console.log("add mapper [new] (physical): (", row, ",", column, ") ->", newValue, ' : ', result)
                this.add(new FormulaMapper(row, column, newValue, result))
            }
        } else {
            //未找到对应元素
            console.log("add mapper [new] (physical): (", row, ",", column, ") ->", newValue, ' : ', result)
            this.add(new FormulaMapper(row, column, newValue, result))
        }

    }

    adjustMapperListForColomn(startColumn, amount) {
        var changeList = [];
        this.list.forEach((mapper) => {
            // mapper存储的是物理坐标，需转换为可视坐标才能确定计算公式是否需要替换
            var virRow = this.toVisualRow(mapper.row)
            var virColumn = this.toVisualColumn(mapper.column)
            if(virColumn >= startColumn) {
                if(mapper.isFormula()) {
                    var formula = mapper.rawValue.toUpperCase();
                    var newFormula = formula.replace(FORMULA_CELL_REG, function(match, p1, offset) {
                        return updateColumnLabel(match, startColumn, amount);
                    })
                }
                var origValue = mapper.rawValue;
                var phyRow = this.toPhysicalRow(virRow);
                var phyColumn = this.toPhysicalColumn(Math.max(virColumn + amount, 0))  // 调整列，其物理坐标也已变化，所以，需要一并更新mapper中的横纵坐标
                console.log('update formula （physical）: (', phyRow, '.', phyColumn, ') ', formula, "->", newFormula)
                mapper.update(phyRow, phyColumn, newFormula, newFormula, OUT_OF_DATE)
                changeList.push(new Change(phyRow, phyColumn, origValue, newFormula))
            }
        });
        return changeList;
    }

    saveMapperCoorInfo () {
        this.mapperSaver = new Map()
        this.list.forEach((mapper) => {
            var virRow = this.toVisualRow(mapper.row)
            this.mapperSaver.set(mapper, virRow)
        })
    }

    getMapperValueByMapper (tMapper) {
       for (var [mapper, row] of this.mapperSaver) {
        if(mapper.row == tMapper.row && mapper.column == tMapper.column) {
            return row;
        }
      }
    }

    adjustMapperListForSorting() {
        var changeList = [];
        this.list.forEach((mapper) => {
            var virRowBefore = this.getMapperValueByMapper(mapper) // 取出行变换前映射的行号
            var virRowNow = this.toVisualRow(mapper.row)    // 行变化后映射的行号
            var virColumnNow = this.toVisualColumn(mapper.column)   
            var deltaRow = virRowNow - virRowBefore // 变换前后行号的差异
            if(deltaRow != 0) {
                if(mapper.isFormula()) {
                    var formula = mapper.rawValue.toUpperCase();
                    var newFormula = formula.replace(FORMULA_CELL_REG, function(match, p1, offset) {
                        return updateRowLabel(match, deltaRow);
                    })
                }
                var origValue = mapper.rawValue;
                var phyRow = mapper.row;  // 排序，变化的仅仅是可视坐标（公式是基于可视坐标），其物理坐标未变化，因此无需更新mapper中的横纵坐标
                var phyColumn = this.toPhysicalColumn(virColumnNow)
                console.log('update formula （physical）: (', phyRow, '.', phyColumn, ') ', formula, "->", newFormula)
                mapper.update(phyRow, phyColumn, newFormula, newFormula, OUT_OF_DATE)
                changeList.push(new Change(phyRow, phyColumn, origValue, newFormula))
            }
        })
        this.cleanMapperCoordInfo()
        return changeList
    }

    cleanMapperCoordInfo() {
        this.mapperSaver.clear()
    }

    syncOutOfDateMappersToTable(callback, source) {
        if(typeof callback != 'function') {
            console.log("未传入回调函数，请检查")
            return;
        }
        // 避免list受callback影响，此处需深复制list
        var tempList = $.extend(true, [], this.list)
        tempList && tempList.forEach((mapper) => {
            if(mapper.status != UPDATE_TO_DATE) {
                var virRow = this.toVisualRow(mapper.row)
                var virColumn = this.toVisualColumn(mapper.column)
                console.log("sync out of date mapper to table: (", virRow, ".", virColumn, ")" )
                callback(virRow, virColumn, mapper.rawValue, source)
                mapper.status = UPDATE_TO_DATE
            }
        })
    }
}
