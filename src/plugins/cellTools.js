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

export function updateColumnLabel(label, amount) {
  const COL_REG = /[A-Z]+/;
  const BASE = 'A'.charCodeAt(0) - 1;
  var matches = label.match(COL_REG)
  var colLabel = matches ? matches[0] : ''
  var newLabel = number2Label(label2Number(colLabel) + amount)
  return newLabel;
}
