"use strict"

var tableUI = {
  alphabet: {
    alphabet:'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split(''),
    makeName:function  (num, str) {
      if (isNaN(num)) {return null;}
      if (!str) {str = '';}
      if (num < 26) {
        str = this.alphabet[num] + str;
        return str;
      } else {
        str = this.alphabet[num%26] + str;
        return this.makeName (Math.floor(num/26)-1, str);
      }
    },
  },

  table: {
    tag: 'table',
    addEvent: function (eventName, func){
      if (this.node) {
        this.node.addEventListener(eventName, func());
      }
    }
  },
  row: {
    tag: 'tr',
    addEvent: function (eventName, func){
      if (this.node) {
        this.node.addEventListener(eventName, func());
      }
    }
  },
  cell: {
    tag: 'td',
    addEvent: function (eventName, func){
      if (this.node) {
        this.node.addEventListener(eventName, func);
      }
    }
  },
  col: {},


  mouseEvents: {
    cellClick: function (event){
      return function (event) {
        if (this.getAttribute("active") !== 'true'){
          tableUI.mouseEvents.disableActive ();
          this.setAttribute('active', 'true');
          tableUI.cell.lastNode = this;
          if (this.childNodes.length === 0){
            tableUI.create('input', this);
            tableUI.input.node.focus();
          } else {
            if (this.childNodes[0].data){
              var text = this.childNodes[0].data;
              this.removeChild(this.childNodes[0]);
              tableUI.create('input', this);
              tableUI.input.node.value = text;
              tableUI.input.node.focus();
              }
            }
          }
        };
    },

    rowClick:function (event){
      return function (event) {
        if (this.parentNode.getAttribute("active") !== 'true'){
          tableUI.mouseEvents.disableActive ();
          this.parentNode.setAttribute('active', 'true');
          tableUI.row.lastNode = this.parentNode;
        }
      };
    },

    colClick: function (event){
      return function (event) {
        var col = document.getElementsByClassName(this.className);
        if (col[1].getAttribute("active-col") !== 'true'){
          tableUI.mouseEvents.disableActive ();
          for (var i = 1; i < col.length; i += 1){
            col[i].setAttribute('active-col', 'true');
          }
        tableUI.col.lastCol = col;
        }
      };
    },

    disableActive: function () {
      if (tableUI.row.lastNode) {
        tableUI.row.lastNode.setAttribute('active', 'false');
      }
      if (tableUI.cell.lastNode) {
        tableUI.cell.lastNode.setAttribute('active', 'false');
        if (tableUI.cell.lastNode.childNodes[0]){
          var text = tableUI.cell.lastNode.childNodes[0].value || tableUI.cell.lastNode.childNodes[0].data;
          tableUI.cell.lastNode.removeChild(tableUI.cell.lastNode.childNodes[0]);
          if (text) {
            tableUI.cell.lastNode.appendChild(document.createTextNode(text));
          }
        }
      }
      if (tableUI.col.lastCol) {
        for (var i = 1; i < tableUI.col.lastCol.length; i += 1){
          tableUI.col.lastCol[i].setAttribute('active-col', 'false');
        }
      }
    }
  },

  keyCodes:{
    ENTER: 13,
    RIGHT_ARROW: 39,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    DOWN_ARROW: 40
  },

  keyboardEvents:{
    onCells:function (event){
      return function (event) {
        if (event.keyCode === tableUI.keyCodes.ENTER) {
          tableUI.mouseEvents.disableActive(this);
        } else if (event.keyCode === tableUI.keyCodes.DOWN_ARROW) {
          tableUI.mouseEvents.disableActive(this);
          tableUI.keyboardEvents.rowNum = parseInt(this.parentElement.className) + 1;
          tableUI.keyboardEvents.column = document.getElementsByClassName(this.className);
          tableUI.mouseEvents.cellClick ().bind(tableUI.keyboardEvents.column[tableUI.keyboardEvents.rowNum])();
        } else if (event.keyCode === tableUI.keyCodes.UP_ARROW) {
          tableUI.mouseEvents.disableActive(this);
          tableUI.keyboardEvents.rowNum = parseInt(this.parentElement.className);
          if (tableUI.keyboardEvents.rowNum > 1) {
            tableUI.keyboardEvents.rowNum -= 1;
            tableUI.keyboardEvents.column = document.getElementsByClassName(this.className);
            tableUI.mouseEvents.cellClick ().bind(tableUI.keyboardEvents.column[tableUI.keyboardEvents.rowNum])();
          }
        } else if (event.keyCode === tableUI.keyCodes.LEFT_ARROW) {
          tableUI.mouseEvents.disableActive(this);
          tableUI.keyboardEvents.colLetter = tableUI.alphabet.alphabet[tableUI.alphabet.alphabet.indexOf(this.className)];
          if (tableUI.keyboardEvents.colLetter>'A'){
            tableUI.keyboardEvents.colLetter = tableUI.alphabet.alphabet[tableUI.alphabet.alphabet.indexOf(tableUI.keyboardEvents.colLetter)-1];
            tableUI.keyboardEvents.column = document.getElementsByClassName(tableUI.keyboardEvents.colLetter);
            tableUI.keyboardEvents.rowNum = parseInt(this.parentElement.className);
            tableUI.mouseEvents.cellClick ().bind(tableUI.keyboardEvents.column[tableUI.keyboardEvents.rowNum])();
          }
        } else if (event.keyCode === tableUI.keyCodes.RIGHT_ARROW) {
          tableUI.mouseEvents.disableActive(this);
          tableUI.keyboardEvents.colLetter = tableUI.alphabet.alphabet[tableUI.alphabet.alphabet.indexOf(this.className)+1];
          tableUI.keyboardEvents.column = document.getElementsByClassName(tableUI.keyboardEvents.colLetter);
          tableUI.keyboardEvents.rowNum = parseInt(this.parentElement.className);
          tableUI.mouseEvents.cellClick ().bind(tableUI.keyboardEvents.column[tableUI.keyboardEvents.rowNum])();
        }
      };
    }
  },

  scrollEvents: {
    horisontalAdd: function () {
      if (tableUI.table.node.clientWidth < document.body.scrollLeft + screen.width){
        tableUI.addCol();
      }
    },
    verticalAdd: function () {
      if (tableUI.table.node.clientHeight < document.body.scrollTop + screen.height){
        tableUI.addRow();
      }
    }
  },

  newTab: function () {
    var tabs = document.getElementsByClassName("tabs")[0];
    this.create('div', tabs);
    var number = tabs.children.length.toString();
    this.div.node.className = "tab";
    this.create('input', this.div.node);
    this.input.node.setAttribute('type', 'radio');
    this.input.node.setAttribute('name', 'tab-group-1');
    this.input.node.checked = true;
    this.input.node.id ='tab-' + number;
    this.create('label', this.div.node);
    this.label.node.innerHTML = 'Sheet ' + number;
    this.label.node.setAttribute('for', this.input.node.id);
    this.newTable(40, 15);
  },

  newTable: function (rows, cols){
    var div = document.createElement("div");
    div.id = 'tableDiv';
    var footer = document.getElementsByClassName("footer")[0];
    if (footer.previousSibling.id === 'tableDiv') {
      document.body.removeChild(footer.previousSibling);}
    document.body.insertBefore(div, footer);
    this.create('table', div.id);

    for (var i = 0; i <= rows; i += 1){
      this.create('row', this.table.node);
      this.row.node.className = i.toString();
      for (var j=0; j <= cols; j += 1){
        this.create('cell', this.row.node);
        if (j >0) {
          this.cell.node.className = this.alphabet.makeName(j-1, '');
          if (i===0){
            this.cell.node.innerHTML = this.cell.node.className;
            this.cell.addEvent('click', this.mouseEvents.colClick());}
        }
        if (j > 0 && i > 0) {
          this.cell.addEvent('click', this.mouseEvents.cellClick());
          this.cell.addEvent('keydown', this.keyboardEvents.onCells());
        } else {
          if (i > 0) {this.cell.node.innerHTML = i;}
          if (j === 0) {this.cell.addEvent('click', this.mouseEvents.rowClick());}
        }
      }
    }
    window.addEventListener("scroll", this.scrollEvents.horisontalAdd);
    window.addEventListener("scroll", this.scrollEvents.verticalAdd);
  },

  create: function (element, parentElement) {
      if (this[element] && this[element].tag){
        this[element].node = document.createElement(this[element].tag);
      } else {
        this[element] = {};
        this[element].tag = element;
        this[element].addEvent = function (eventName, func){
          if (this.node) {
            this.node.addEventListener(eventName, func);
          }
        };
        this[element].node = document.createElement(element);
      }
      if (parentElement) {
        if (typeof parentElement === 'string'){
          document.getElementById(parentElement).appendChild(this[element].node);
        } else if (parentElement.hasOwnProperty('node')){
          parentElement.node.appendChild(this[element].node);
        } else {
          parentElement.appendChild(this[element].node);
        }
      }
    },

  addCol: function() {
    var table = this.table.node;
    var colLen = table.childNodes.length;
    var rowLen = table.childNodes[0].childNodes.length;
    var colName = this.alphabet.makeName(rowLen-1);
    for (var i = 0; i < colLen; i += 1){
      this.create('cell',this.table.node.childNodes[i]);
      this.cell.node.className = colName;
      if (i > 0){
        this.cell.addEvent('click', this.mouseEvents.cellClick());
        this.cell.addEvent('keydown', this.keyboardEvents.onCells());
      }
      if (i === 0){
        this.cell.node.innerHTML = colName;
        this.cell.addEvent('click', this.mouseEvents.colClick());
      }
    }
  },

  addRow: function() {
    var table = this.table.node;
    var colLen = table.childNodes.length;
    var rowLen = table.childNodes[0].childNodes.length;
    var colName = this.alphabet.makeName(rowLen-1);
    this.create('row', table);
    this.row.node.className = colLen.toString();
    for (var i = 0; i < rowLen; i += 1){
      this.create('cell', this.row.node);
      if (i===0) {
        this.cell.node.innerHTML = colLen.toString();
        this.cell.addEvent('click', this.mouseEvents.rowClick());
      } else {
        this.cell.node.className = this.alphabet.makeName(i-1, '');
        this.cell.addEvent('click', this.mouseEvents.cellClick());
        this.cell.addEvent('keydown', this.keyboardEvents.onCells());
      }

    }

  },
  initTable: function () {
    this.newTab();
  }
};
tableUI.initTable();
document.getElementById('new').addEventListener('click',function(){
  tableUI.newTab();

});




