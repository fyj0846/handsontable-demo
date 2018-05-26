const BASE = 'A'.charCodeAt(0) - 1;
const CELL_COLUMN_REG = /[A-Z]+/;
const CELL_ROW_REG = /\d+/;

export default class TableCell {
  constructor(row, column, _value, value) {
    this.row = row;
    this.column = column;
    this._value = _value;
    this.value = value;
  }
}
export function label2Number(label) {
  var colIndex = 0;
  for (var i = 0; i < label.length; i++) {
    var c = label[i];
    colIndex = colIndex * 26 + (c.charCodeAt(0) - BASE)
  }
  return colIndex
}

export function number2Label(colNum) {
  var label = [];
  if (colNum > 0) {
    if (colNum >= 1 && colNum <= 26) {
      label.push(String.fromCharCode(BASE + colNum))
    }
    else {
      while (colNum >= 26) {
        var count = parseInt(colNum / 26)
        var remainder = colNum % 26
        if (remainder == 0) {
          remainder = 26;
          count--;
          label.unshift(String.fromCharCode(BASE + remainder))
        } else {
          label.unshift(String.fromCharCode(BASE + remainder))
        }
        colNum = count;
      }
      if(colNum > 0) {
        label.unshift(String.fromCharCode(BASE + colNum % 26));
      }
    }
    return label.join('')
  }
}

export function updateColumnLabel(label, startColumn, amount) {
  var colMatches = label.match(CELL_COLUMN_REG)
  var colLabel = colMatches ? colMatches[0] : ''
  var rowMatches = label.match(CELL_ROW_REG)
  var rowLabel = rowMatches ? rowMatches[0] : ''
  var columnIndex = label2Number(colLabel);
  // 判断公式引用列是否在影响范围内
  if(columnIndex > startColumn) {
    return number2Label(columnIndex + amount) + rowLabel
  } else {
    return label;
  }
}

export function updateRowLabel(label, amount) {
  var colMatches = label.match(CELL_COLUMN_REG)
  var colLabel = colMatches ? colMatches[0] : ''
  var rowMatches = label.match(CELL_ROW_REG)
  var rowLabel = rowMatches ? rowMatches[0] : ''
  // 仅能支持公式引用单元格在同一行的情况
  return colLabel + (rowLabel - 0 + amount);
}
