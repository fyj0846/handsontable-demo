import Handsontable from 'handsontable'
import {Parser} from 'hot-formula-parser'

function PNFormulaPlugin(hotInstance) {
    Handsontable.plugins.BasePlugin.call(this, hotInstance);
    this._superClass = Handsontable.plugins.BasePlugin;

    /**
     * Array containing the vocabulary used in the plugin.
     *
     * @type {Array}
     */
    this.formulaMapper = [];  // [{row: x, col: y, formula: =A1+B1, value: 37}]
    this.parser = new Parser();
    this.parser.on('callCellValue', callCellValue.bind(this));

    function callCellValue (coord, done) {
      var row = coord.row.index; //coord.row.isAbsolute
      var col = coord.column.index; //coord.column.isAbsolute
      var result = this.hot.getDataAtCell(row,col);  //todo： 测出可能是公式，还需迭代解析
      done(result)
    }
    // todo: 功能待开发
    function callRangeValue (coordStart, coordEnd, done) {
      var row1 = coordStart.row.index; //coord.row.isAbsolute
      var col1 = coordStart.column.index; //coord.column.isAbsolute
      var result = this.hot.getDataAtCell(row1,col1);  //todo： 测出可能是公式，还需迭代解析
      done(result)
    }
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
  PNFormulaPlugin.prototype.isEnabled = function() {
    return !!this.hot.getSettings().PNFormulaPlugin;
  };

  /**
   * Enable the plujgin.
   */
  PNFormulaPlugin.prototype.enablePlugin = function() {
    this.addHook('afterChange', this.onAfterChange.bind(this));
    this.addHook('beforeChange', this.onBeforeChange.bind(this));
    this.addHook('afterSetDataAtCell',this.afterSetDataAtCell.bind(this));
    this.addHook('modifyData', this.onModifyData.bind(this));
    this._superClass.prototype.enablePlugin.call(this);
  };

  /**
   * Disable the plugin.
   */
  PNFormulaPlugin.prototype.disablePlugin = function() {
    this.vocabularyArray = [];

    this._superClass.prototype.disablePlugin.call(this);
  };

  /**
   * Update the plugin.
   */
  PNFormulaPlugin.prototype.updatePlugin = function() {
    this.disablePlugin();
    this.enablePlugin();

    this._superClass.prototype.updatePlugin.call(this);
  };

  /**
   * The afterChange hook callback.
   *
   * @param {Array} changes Array of changes.
   * @param {String} source Describes the source of the change.
   */
  PNFormulaPlugin.prototype.onAfterChange = function(changes, source) {
    //
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


  PNFormulaPlugin.prototype.onBeforeChange = function(changes, source) {
    // Check wheter the changes weren't blank or the hook wasn't triggered inside this callback.
    console.log('onBeforeChange!')
  }

  PNFormulaPlugin.prototype.onModifyData = function(row, col, valueHolder, ioMode) {
    console.log("modifyData fired!")
    // 公式检测
    if (ioMode === 'get' && this.isFormulaCell(row, col)) {
      valueHolder.value = this.getFormulaCell(row, col);
    }
    // else if (ioMode === 'set' && (0, _utils.isFormulaExpression)(valueHolder.value)) {
    //   valueHolder.value = (0, _utils.toUpperCaseFormula)(valueHolder.value);
    // }
  }

  PNFormulaPlugin.prototype.isFormulaCell = function(row, col) {
    this.formulaMapper.forEach(function(item) {
      if(item.row == row && item.column == col) {
        return true;
      }
    })
    return false;
  }

  PNFormulaPlugin.prototype.getFormulaCell = function(row, col) {
    this.formulaMapper.forEach(function(item) {
      if(item.row == row && item.column == col) {
        return item.value;
      }
    })
    return '';
  }

  PNFormulaPlugin.prototype.afterSetDataAtCell = function(changes, source) {
    // Check wheter the changes weren't blank or the hook wasn't triggered inside this callback.
    if (!changes || source === 'PNFormulaPlugin') {
      return;
    }

    // [row, col, original, new]
    if(changes && changes.length > 0 && changes[0][3].startsWith('=')) {
      var formula = changes[0][3].slice(1)
      const {error, result} = this.parser.parse(formula);
      // todo: 需要优化
      this.formulaMapper.push({row: changes[0][0], column: changes[0][1], rawValue: changes[0][2], value: result})
    }
  }

  /**
   * Destroy the plugin.
   */
  PNFormulaPlugin.prototype.destroy = function() {
    this._superClass.prototype.destroy.call(this);
  };

  Handsontable.plugins.registerPlugin('PNFormulaPlugin', PNFormulaPlugin);
