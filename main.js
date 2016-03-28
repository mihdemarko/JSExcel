function element(name,tag,inner,className,appendElementClass) {
  this.name = name;
  this.node=document.createElement(tag);
  if (name === 'input') {this.node.value = inner;}
  if (inner) {this.node.innerHTML = inner;}
  if (className) {this.node.className = className;}
  if (appendElementClass) {
    document.getElementsByClassName(appendElementClass)[0].appendChild(this.node);
  }
}

element.prototype.addEvent = function(event,func){
  this.node.addEventListener(event, func);
};

var table = new element('table','table',null,'table','tableDiv');
var alphabet = 'abcdefghijklmnopqrstuvwx'.toUpperCase().split('');


var rowName;
var cellName;
var cells = [];
var lastCell;
var lastCol;
var lastRow;


for (var i = 0; i<= 100; i++){
  rowName = 'tr' + i;
  var tr = new element(rowName, 'tr', null, rowName, 'table');
  cells.push([]);

  for (var j = 0; j<=23; j++){
      cellName = rowName.replace('r','d') + j;
      var td = new element(cellName, 'td', null, cellName,rowName);
      if (i>0 && j>0){
        td.addEvent('click', function(event){
          whiteAll (lastCol, lastRow, lastCell);
          this.style.backgroundColor='rgb(230,230,230)';
          this.style.border='2px solid rgb(100,150,200)';
          lastCell = this;
        });
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
}

  );


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
