import Handsontable from 'handsontable'
import {Parser} from 'hot-formula-parser'
import FormulaMapper from './FormulaMapper'
import Change from './Change'
import {updateColumnLabel} from '../cellTools'
import {UPDATE_TO_DATE, OUT_OF_DATE} from '../config'
import FormulaMapperList from './FormulaMapperList';

function PNFormulaPlugin(hotInstance) {
  Handsontable.plugins.BasePlugin.call(this, hotInstance);
  this._superClass = Handsontable.plugins.BasePlugin;
  // 公式选择正则
  this.CELL_REG = /\s*(\$?[A-Z]+\$?\d+)\s*/g;
  this.PURE_CELL_REG = /\$?[A-Z]+\$?\d+/g;
  // 功能：从handsontable data source中取单个单元格数据
  this.callCellValue = function(coord, done) {
    var row = coord.row.index; //coord.row.isAbsolute
    var col = coord.column.index; //coord.column.isAbsolute
    var result = this.hot.getDataAtCell(row, col);  //todo： 测出可能是公式，还需迭代解析
    done(result)
  }

  // 功能：从handsontable data source中取范围单元格数据
  this.callRangeValue = function(coordStart, coordEnd, done) {
    var row1 = coordStart.row.index; //coord.row.isAbsolute
    var col1 = coordStart.column.index; //coord.column.isAbsolute
    var row2 = coordEnd.row.index; //coord.row.isAbsolute
    var col2 = coordEnd.column.index; //coord.column.isAbsolute

    var fragment = [];
    for (var row = row1; row <= row2; row++) {
      var rowData = this.hot.getDataAtRow(row);
      var colFragment = [];
      for (var col = col1; col <= col2; col++) {
        colFragment.push(rowData[col]);
      }
      fragment.push(colFragment);
    }
    if (fragment) {
      done(fragment);
    }
  }

  /**
   * Array containing the vocabulary used in the plugin.
   *
   * @type {Array}
   */
  this.formulaMapperList = new FormulaMapperList();  // [{row: x, col: y, rawValue: =A1+B1, value: 37}]
  this.parser = new Parser();
  this.parser.on('callCellValue', this.callCellValue.bind(this));
  this.parser.on('callRangeValue', this.callRangeValue.bind(this));

  // this.isFormulaCell = function (row, column) {
  //   for (var i = 0; i < this.formulaMapperList.length; i++) {
  //     var item = this.formulaMapperList[i];
  //     if(item.isEqual(row, column)) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // this.getFormulaCell = function (row, col) {
  //   for (var i = 0; i < this.formulaMapperList.length; i++) {
  //     var item = this.formulaMapperList[i];
  //     if(item.isEqual(row, column)) {
  //       return item.getValue();
  //     }
  //   }
  //   return null;
  // }

  // this.updateFormulaMapperList = function (change, result) {
  //   for (var j = 0; j < this.formulaMapperList.length; j++) {
  //     if (this.formulaMapperList[j].row == change[0] && this.formulaMapperList[j].column == change[1]) {
  //       break;
  //     }
  //   }
  //   // todo: 需要优化
  //   if(j == this.formulaMapperList.length) {
  //     console.log("add mapper [new]: ", change[0] , ":",change[1], "->", result)
  //     this.formulaMapperList.push({ row: change[0], column: change[1], rawValue: change[3], value: result, status: 0 })
  //   } else {
  //     // 找到历史数据
  //     if(this.formulaMapperList[j].rawValue != change[3] || this.formulaMapperList[j].value != result) {
  //       console.log("remove mapper: ", change[0] , ":",change[1], "->", this.formulaMapperList[j].value)
  //       this.formulaMapperList.splice(j, 1);
  //       console.log("add mapper [update]: ", change[0] , ":",change[1], "->", result)
  //       this.formulaMapperList.push({ row: change[0], column: change[1], rawValue: change[3], value: result, status: 0 })
  //     }
  //   }
  // }
}

PNFormulaPlugin.prototype = Object.create(Handsontable.plugins.BasePlugin.prototype, {
  constructor: {
    writable: true,
    configurable: true,
    value: PNFormulaPlugin
  }
});

/**
 * Check if the plugin is enabled in the settings.
 */
PNFormulaPlugin.prototype.isEnabled = function () {
  return !!this.hot.getSettings().PNFormulaPlugin;
};

/**
 * Enable the plujgin.
 */
PNFormulaPlugin.prototype.enablePlugin = function () {
  this.addHook('afterChange', this.onAfterChange.bind(this));
  this.addHook('beforeChange', this.onBeforeChange.bind(this));
  this.addHook('afterSetDataAtCell', this.afterSetDataAtCell.bind(this));
  this.addHook('modifyData', this.onModifyData.bind(this));
  this.addHook('beforeCreateCol', this.onBeforeCreateCol.bind(this));
  this.addHook('afterCreateCol', this.onAfterCreateCol.bind(this));
  this._superClass.prototype.enablePlugin.call(this);
};

/**
 * Disable the plugin.
 */
PNFormulaPlugin.prototype.disablePlugin = function () {
  this.formulaMapperList = [];
  this._superClass.prototype.disablePlugin.call(this);
};

/**
 * Update the plugin.
 */
// PNFormulaPlugin.prototype.updatePlugin = function () {
//   this.disablePlugin();
//   this.enablePlugin();
//
//   this._superClass.prototype.updatePlugin.call(this);
// };

/**
 * The afterChange hook callback.
 *
 * @param {Array} changes Array of changes.
 * @param {String} source Describes the source of the change.
 */
PNFormulaPlugin.prototype.onAfterChange = function (changes, source) {
  // // Check wheter the changes weren't blank or the hook wasn't triggered inside this callback.
  // if (!changes || source === 'PNFormulaPlugin') {
  //   return;
  // }
  //
  // var arrayEach = Handsontable.helper.arrayEach;
  // var _this = this;
  //
  // arrayEach(changes, function(change, i) {
  //   arrayEach(_this.vocabularyArray, function(entry, j) {
  //
  //     if (change[3] && change[3].toString().toLowerCase() === entry[0].toLowerCase()) {
  //       _this.hot.setDataAtCell(change[0], change[1] + 1, entry[1], 'PNFormulaPlugin');
  //     }
  //
  //   });
  // });
};

PNFormulaPlugin.prototype.onBeforeChange = function (changes, source) {
  // Check wheter the changes weren't blank or the hook wasn't triggered inside this callback.
  console.log('onBeforeChange!')
}

PNFormulaPlugin.prototype.onBeforeCreateCol = function(column, amount, source)  {
  console.log("onBeforeCreateCol: ", column, amount, source)
}

PNFormulaPlugin.prototype.onAfterCreateCol = function (column, amount, source) {
  console.log("onAfterCreateCol: ", column, amount, source)
  // update mapper
  var changes = this.formulaMapperList.adjustMapperListForColomn(column, amount)
  // update hot table data source
  this.formulaMapperList.syncOutOfDateMappersToTable(this.hot.setDataAtCell, source)
  // how to trigger update?
  // this.hot.updateSettings({data: this.hot.getSourceData()}, false)
  // this.hot.render();
}

PNFormulaPlugin.prototype.onModifyData = function (row, col, valueHolder, ioMode) {
  // 公式检测
  if (ioMode === 'get' && this.formulaMapperList.isExist(row, col)) {
    console.log('onModifyData for formula cell!')
    var mapper = this.formulaMapperList.getMapperByCoord(row, col);
    valueHolder.value = mapper && mapper.value
  }
  // else if (ioMode === 'set' && (0, _utils.isFormulaExpression)(valueHolder.value)) {
  //   valueHolder.value = (0, _utils.toUpperCaseFormula)(valueHolder.value);
  // }
}

PNFormulaPlugin.prototype.afterSetDataAtCell = function (changes, source) {
  console.log('afterSetDataAtCell!')
  if (!changes || source === 'PNFormulaPlugin') {
    return;
  }
  // [row, col, original, new]
  changes.forEach((item) => {
    // 判断新字段为公式
    var change = new Change(item[0], item[1], item[2], item[3]);
    if(change.isFormula()) {
      var formula = change.newValue && change.newValue.slice(1);
      const {error, result} = this.parser.parse(formula);
      if(result) {
        this.formulaMapperList.updateMapperByChange(change, result)
      }
    }
  })
}

/**
 * Destroy the plugin.
 */
PNFormulaPlugin.prototype.destroy = function () {
  this._superClass.prototype.destroy.call(this);
};

Handsontable.plugins.registerPlugin('PNFormulaPlugin', PNFormulaPlugin);
