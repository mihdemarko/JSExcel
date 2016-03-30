function Element(name, tag, inner, className, parentElement) {
  this.name = name;
  this.node=document.createElement(tag);
  if (name === 'input') {this.node.value = inner;}
  if (inner) {this.node.innerHTML = inner;}
  if (className) {this.node.className = className;}
  if (parentElement) {
    if (typeof parentElement === 'string'){
      document.getElementById(parentElement).appendChild(this.node);
    } else if (parentElement.hasOwnProperty('node')){
      parentElement.node.appendChild(this.node);
    } else {
      parentElement.appendChild(this.node);
    }
  }
}

Element.prototype.addEvent = function(event,func){
  this.node.addEventListener(event, func);
};

var table = new Element('table', 'table', null, 'table', 'tableDiv');
var alphabet = 'abcdefghijklmnopqrstuvwx'.toUpperCase().split('');


var rowName;
var cellName;
var cells = [];
var lastCell;
var lastCol;
var lastRow;
function cellClick (event){
  return function () {
      whiteAll (lastCol, lastRow, lastCell);
      if (this.childNodes.length === 0){
        var input = new Element('input', 'input', null, null, this);
         input.node.focus();
      } else {
        console.log(this);
        var text = this.childNodes[0].data;
        this.removeChild(this.childNodes[0]);
        var input = new Element('input', 'input', text, null, this);
        input.node.focus();
      }
      this.style.backgroundColor='rgb(230,230,230)';
      this.style.border='2px solid rgb(100,150,200)';
      lastCell = this;
    };

}

for (var i = 0; i<= 100; i++){
  rowName = 'tr' + i;
  var tr = new Element(rowName, 'tr', null, rowName, table);
  cells.push([]);

  for (var j = 0; j<=23; j++){
      cellName = rowName.replace('r','d') + j;
      var td = new Element(cellName, 'td', null, cellName, tr);
      if (i>0 && j>0){
        td.addEvent('click', cellClick(event));
      }
      cells[i].push(td);
      if (j===0){
        if (i>=1)  {
          td.node.innerHTML = i.toString();}}
  }
}


cells[0].forEach(function(cell,i){
  if (i>0){
    cell.node.innerHTML=alphabet[i-1];
    cell.addEvent('click', function(event){
      whiteAll (lastCol, lastRow, lastCell);
      for (var j=1;j <= cells.length-1; j++){
        cells[j][i].node.style.backgroundColor='rgb(200,200,200)';
      }
      lastCol = this;
    });
    }
  }
  );

cells.forEach(function(row, i){
  if (i>0) {
    row[0].addEvent('click', function(event){
      whiteAll (lastCol, lastRow, lastCell);
        this.parentElement.style.backgroundColor='rgb(200,200,200)';
      lastRow = this.parentElement;
    });
  }
});


function whiteCol(lastNode){
  var lastN = parseInt(lastNode.className.replace('td',''));
  for (var j=1;j <= cells.length-1; j++){
    cells[j][lastN].node.style.backgroundColor='';
  }
}

function whiteRow(lastNode){
  lastNode.style.backgroundColor='';
}

function whiteCell(lastCell) {
  lastCell.style.backgroundColor='';
  lastCell.style.border='';
  if (lastCell.childNodes[0]){
    var text = lastCell.childNodes[0].value;
    lastCell.removeChild(lastCell.childNodes[0]);
    if (text) {
      lastCell.appendChild(document.createTextNode(text));
    }
    console.log(lastCell.childNodes.length);

  }
  // console.log(lastCell.childNodes[0].value, lastCell.value);
}

function whiteAll (lastCol, lastRow, lastCell){
  if (lastCell) {
    whiteCell(lastCell);
  }
  if (lastCol) {
    whiteCol(lastCol);
  }
  if (lastRow){
    whiteRow(lastRow);
  }
}
