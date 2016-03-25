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
  (function(i){
  rowName = 'tr' + i;
  var tr = new element(rowName, 'tr', null, rowName, 'table');
  if (i===0){tr.node.style.backgroundColor = 'rgb(150,200,150)';}
  cells.push([]);


  for (var j = 0; j<=23; j++){
    (function(i,j) {
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
        td.node.style.backgroundColor = 'rgb(150,200,150)';
        td.node.style.borderColor = 'black';
        td.node.style.width = '50px';
        td.node.style.textAlign = 'center';
      if (i>=1)  {
        td.node.innerHTML = i.toString();}}
    })(i,j);
  }})(i);
}


cells[0].forEach(function(cell,i){
  if (i>0){
    cell.node.innerHTML=alphabet[i-1];
    cell.node.style.textAlign = 'center';
    cell.node.style.borderColor = 'black';
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
    for (var j=1;j <= row.length-1; j++){
      row[j].node.style.backgroundColor='rgb(200,200,200)';
    }
    lastRow = this;
  });
}
}

  );


function whiteCol(lastNode){
  var lastN = parseInt(lastNode.className.replace('td',''));
  for (var j=1;j <= cells.length-1; j++){
    cells[j][lastN].node.style.backgroundColor='white';
  }
}

function whiteRow(lastNode){
  var lastN = parseInt(lastNode.innerHTML);
  for (var j=1;j <= cells[0].length-1; j++){
    cells[lastN][j].node.style.backgroundColor='white';
  }
}

function whiteCell(lastCell) {
  lastCell.style.backgroundColor='white';
  lastCell.style.border='1px solid rgb(150,150,150)';
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
