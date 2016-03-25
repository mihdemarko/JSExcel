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
var last;


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
          if (last) {last.style.backgroundColor='white';}
          this.style.backgroundColor='rgb(200,200,200)';
          last = this;
        });
      }
      cells[i].push(td);
      if (j===0){
        td.node.style.backgroundColor = 'rgb(150,200,150)';
        td.node.style.borderColor = 'black';
        td.node.style.width = '50px';
        td.node.style.textAlign = 'center';
      if (i>=1)  {td.node.innerHTML = i.toString();}}
    })(i,j);
  }})(i);
}


cells[0].forEach(function(cell,i){
  if (i>0){
    cell.node.innerHTML=alphabet[i-1];
    cell.node.style.textAlign = 'center';
    cell.node.style.borderColor = 'black';}
  }
  );

