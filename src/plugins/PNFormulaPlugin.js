import Handsontable from 'handsontable'
function PNFormulaPlugin(hotInstance) {
    Handsontable.plugins.BasePlugin.call(this, hotInstance);
    this._superClass = Handsontable.plugins.BasePlugin;
  
    /**
     * Array containing the vocabulary used in the plugin.
     *
     * @type {Array}
     */
    this.vocabularyArray = [];
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
    this.vocabularyArray = [
      ['Hello', 'World!'],
      ['Handsontable', 'is awesome!']
    ];
  
    this.addHook('afterChange', this.onAfterChange.bind(this));
  
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
  
    // Check wheter the changes weren't blank or the hook wasn't triggered inside this callback.
    if (!changes || source === 'PNFormulaPlugin') {
      return;
    }
  
    var arrayEach = Handsontable.helper.arrayEach;
    var _this = this;
  
    arrayEach(changes, function(change, i) {
      arrayEach(_this.vocabularyArray, function(entry, j) {
  
        if (change[3] && change[3].toString().toLowerCase() === entry[0].toLowerCase()) {
          _this.hot.setDataAtCell(change[0], change[1] + 1, entry[1], 'PNFormulaPlugin');
        }
  
      });
    });
  };
  
  /**
   * Destroy the plugin.
   */
  PNFormulaPlugin.prototype.destroy = function() {
    this._superClass.prototype.destroy.call(this);
  };
  
  Handsontable.plugins.registerPlugin('PNFormulaPlugin', PNFormulaPlugin);