"use strict"

var tableUI = {
  alphabet: {
    ALPHABET:'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split(''),
    makeName:function (num, str) {
      if (isNaN(num)) {return null;}
      if (!str) {str = '';}
      if (num < 26) {
        str = this.ALPHABET[num] + str;
        return str;
      } else {
        str = this.ALPHABET[num%26] + str;
        return this.makeName (Math.floor(num/26)-1, str);
      }
    },
  },


  col: {},

  _dataTextNode: function (text) {

      var dataNode = document.createTextNode(text);
      Object.defineProperty(dataNode, 'value', {
        get: function () {
          return this.val;
        },
        set: function (data) {
          var element = tableUI.td.lastNode;
          var cellName = element.className + element.parentElement.className.replace('c','');
          this.val = data;
          tableData[tableUI.currentSheet].data[cellName] = data;
          dataExchange.saveLocal(tableData);
          console.log(dataExchange.loadLocal.loadData('Sheet 1'));
        }
      });
      dataNode.value = text;
      dataNode.data = formula.evaluation(text);
      return dataNode;

  },


  mouseEvents: {
    _cell : function (event) {
      var target = event.target;
      var firstRow = document.querySelector('table').firstChild;
      var firstCol = document.querySelectorAll('tr:first-child');
      var firstCell = target.parentElement.firstChild;
      while (target !== this) {
        if (target.tagName == 'TD'){
          if (target.parentElement === firstRow && target !== firstCell){
            tableUI.mouseEvents._colClick.bind(target)();
          } else if (target === firstCell){
            tableUI.mouseEvents._rowClick.bind(target)();
          } else {
            tableUI.mouseEvents._cellClick.bind(target)();
          }

          return;
        }
        target = target.parentNode;
      }
    },
    _cellClick: function () {
        if (!this.hasAttribute("data-active")){
          tableUI.mouseEvents._disableActive ();
          this.setAttribute('data-active', '');
          tableUI.td.lastNode = this;
        } else if (this.childNodes.length === 0){
          tableUI.create('input', this);
          tableUI.input.node.focus();
        } else {
          if (this.childNodes[0].data){
            var text = this.childNodes[0].value;
            this.removeChild(this.childNodes[0]);
            tableUI.create('input', this);
            tableUI.input.node.value = text;
            tableUI.input.node.focus();
          }
      }
    },

    _rowClick: function (event) {
        if (!this.parentNode.hasAttribute("data-active")){
          tableUI.mouseEvents._disableActive ();
          this.parentNode.setAttribute('data-active', '');
          tableUI.td.lastNode = this;
        }
    },

    _colClick: function (event){
        var col = document.querySelectorAll('.' + this.className);
        if (!col[1].hasAttribute("data-active-col")){
          tableUI.mouseEvents._disableActive ();
          for (var i = 1; i < col.length; i += 1){
            col[i].setAttribute('data-active-col', '');
          }
        tableUI.td.lastNode = col[0];
        }
    },

    _disableActive: function () {
      var col;
      var row;
      var element = tableUI.td.lastNode;
      if (element) {
        if (element.className) {
          col = document.querySelectorAll('.' + element.className);
        }
        row = element.parentElement;
        if (row.hasAttribute('data-active')) {
          row.removeAttribute('data-active');
        }
        element.removeAttribute('data-active');
        if (element.childNodes[0] && element.childNodes[0].tagName === "INPUT"){
          var text = element.childNodes[0].value || element.childNodes[0].data;
          element.removeChild(element.childNodes[0]);
          if (text) {
            element.appendChild(tableUI._dataTextNode(text));
          }
        }
      }

      if (col && col[1].hasAttribute("data-active-col")) {
        for (var i = 1; i < col.length; i += 1){
          col[i].removeAttribute('data-active-col');
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
    _onCells:function (event){
        var UI = tableUI;
        var element = tableUI.td.lastNode;
        if (!element) {
          return;
        }
        var row = element.parentElement;
        var rowNum = parseInt(row.className.replace('c',''));
        var colName = element.className;
        var col;
        if (colName) {
          col = document.querySelectorAll('.' + colName);
        } else {
          col = document.querySelectorAll('td:first-child');
        }
        var table = document.querySelector('table');
        var isFirstChild = element === element.parentElement.firstChild;
        var _leftRight = function (sibling) {
          if (event.target.tagName === "INPUT") {
            return;
          }
          if (sibling){
            if (sibling.className) {
              if (row === table.firstChild) {
                UI.mouseEvents._colClick.bind(sibling)();
              } else {
                UI.mouseEvents._cellClick.bind(sibling)();
              }
            } else {
              UI.mouseEvents._rowClick.bind(sibling)();
            }
          }
        };
        var _upDown = function (colSibling) {
          if (colSibling) {
            if (isFirstChild){
              UI.mouseEvents._rowClick.bind(colSibling)();
            } else if (colSibling.parentElement === table.firstChild) {
              UI.mouseEvents._colClick.bind(colSibling)();
            } else {
              UI.mouseEvents._cellClick.bind(colSibling)();
            }
          }
        };

        if (event.keyCode === UI.keyCodes.ENTER) {
          if (event.target.tagName === 'INPUT'){
            UI.mouseEvents._disableActive();
            UI.mouseEvents._cellClick.bind(element)();
          } else {
            if (rowNum > 0 && !isFirstChild) {
              // console.log(event);
              UI.mouseEvents._cellClick.bind(element)();
            }

          }

        } else if (event.keyCode === tableUI.keyCodes.DOWN_ARROW) {
          _upDown(col[rowNum + 1]);
          event.preventDefault();
          if (screen.height-element.getBoundingClientRect().top < 250){
            document.body.scrollTop += 25;
          }


        } else if (event.keyCode === tableUI.keyCodes.UP_ARROW) {
          _upDown(col[rowNum - 1]);
          event.preventDefault();
          if (element.getBoundingClientRect().top < 100 ){
            document.body.scrollTop -= 25;
          }

        } else if (event.keyCode === tableUI.keyCodes.LEFT_ARROW) {
          _leftRight(element.previousSibling);
          if (event.target.tagName !== "INPUT") {
            event.preventDefault();
            if (element.getBoundingClientRect().left < 200){
              document.body.scrollLeft -= 100;
            }
          }

        } else if (event.keyCode === tableUI.keyCodes.RIGHT_ARROW) {
          _leftRight(element.nextSibling);
          if (event.target.tagName !== "INPUT") {
            event.preventDefault();
              if (screen.width-element.getBoundingClientRect().left < 300){
                document.body.scrollLeft += 100;
          }

          }

        }
    }
  },

  scrollEvents: {
    _horisontalAdd: function (event) {
      var tr = document.body.querySelector("tr:first-child");
      tr.style.left = 30-document.body.scrollLeft + 'px';
      if (tableUI.table.node.clientWidth < document.body.scrollLeft + screen.width){
        tableUI._addCol();
      }
    },
    _verticalAdd: function () {
      var td = document.body.querySelectorAll("td:first-child");
      [].forEach.call(td, function (td, i) {

          td.style.top = 25*i + 30-document.body.scrollTop + 'px';


      });
      if (tableUI.table.node.clientHeight < document.body.scrollTop + screen.height){
        tableUI._addRow();
      }
    }
  },

  newTab: function () {
    var tabs = document.querySelectorAll(".tabs")[0];
    var number = (tabs.children.length + 1).toString();
    if (tabs.lastChild) {
      var n = parseInt(tabs.lastChild.firstChild.id.replace('tab-', ''));
      if (parseInt(number - 1) !== n){
        number = (n + 1).toString();
      }
    }
    this.create('div', tabs);
    this.div.node.className = "tab";
    this.create('input', this.div.node);
    this.input.node.setAttribute('type', 'radio');
    this.input.node.setAttribute('name', 'tab-group-1');
    this.input.node.checked = true;
    this.input.node.id ='tab-' + number;
    var last = tabs.children[tabs.children.length-1].firstChild;
    this.create('label', this.div.node);
    this.label.node.innerHTML = 'Sheet ' + number;
    this.label.node.setAttribute('for', this.input.node.id);
    this.newTable();
    this.div._addEvent('click', tableUI._tabClick);
    this.currentSheet = 'Sheet '+number;
    tableData = {};
    tableData['Sheet '+number] = {
                                  rows:Math.ceil(screen.height/25) + 10,
                                  cols:Math.ceil(screen.width/100) + 4,
                                  data:{}
                                };
    // console.log(tableData);
  },

  _tabClick: function (event) {
      if (!this.children[0].checked){
        tableUI.newTable();
        tableUI.div.node = this;
        tableUI.currentSheet = this.children[1].innerHTML;
        // console.log(tableUI.currentSheet);
      }
  },

  removeTab: function () {
    var div = tableUI.div.node.previousSibling || tableUI.div.node.nextSibling;

    if (div) {
      document.querySelectorAll('.tabs')[0].removeChild(tableUI.div.node);
        tableUI._tabClick.bind(div)();
        div.children[0].checked = true;
    }

  },

  newTable: function (){
    var div = document.getElementById(this.root);
    if (div.firstChild) {
      div.removeChild(div.firstChild);
    }
    this.create('table', div);
    window.addEventListener('keydown', this.keyboardEvents._onCells);
    this.table._addEvent('click', this.mouseEvents._cell);
    for (var i = 0; i <= this.rowNum; i += 1){
      this.create('tr', this.table.node);
      this.tr.node.className = 'c' + i.toString();
      for (var j=0; j <= this.colNum; j += 1){
        this.create('td', this.tr.node);
        if (j >0) {
          this.td.node.className = this.alphabet.makeName(j-1, '');
          if (i===0){
            this.td.node.innerHTML = this.td.node.className;
          }
        }
        if (j === 0 && i > 0) {
          this.td.node.innerHTML = i;
        }
      }
    }
    window.addEventListener("scroll", this.scrollEvents._horisontalAdd);
    window.addEventListener("scroll", this.scrollEvents._verticalAdd);
  },

  create: function (element, parentElement, before) {
      if (this[element] && this[element].tag){
        this[element].node = document.createElement(this[element].tag);
      } else {
        this[element] = {};
        this[element].tag = element;
        this[element]._addEvent = function (eventName, func){
          if (this.node) {
            this.node.addEventListener(eventName, func);
          }
        };
        this[element].node = document.createElement(element);
      }
      if (!before) {
        if (parentElement) {
          if (typeof parentElement === 'string'){
            document.getElementById(parentElement).appendChild(this[element].node);
          } else if (parentElement.hasOwnProperty('node')){
            parentElement.node.appendChild(this[element].node);
          } else {
            parentElement.appendChild(this[element].node);
          }
        }
      } else {
        if (parentElement) {
          var child;
          var parent;
          if (typeof parentElement === 'string'){
            child = document.getElementById(parentElement);
            parent = child.parentElement;
            parent.insertBefore(this[element].node, child);
          } else if (parentElement.hasOwnProperty('node')){
            child = parentElement.node;
            parent = child.parentElement;
            parent.insertBefore(this[element].node, child);
          } else {
            child = parentElement;
            parent = child.parentElement;
            parent.insertBefore(this[element].node, child);
          }
        }
      }
    },

  _addCol: function() {
    var table = this.table.node;
    var colLen = table.childNodes.length;
    var rowLen = table.childNodes[0].childNodes.length;
    var colName = this.alphabet.makeName(rowLen-1);
    for (var i = 0; i < colLen; i += 1){
      this.create('td',this.table.node.childNodes[i]);
      this.td.node.className = colName;
      if (i > 0){
        // this.td._addEvent('keydown', this.keyboardEvents._onCells());
      }
      if (i === 0){
        this.td.node.innerHTML = colName;
        // this.td._addEvent('click', this.mouseEvents._colClick());
      }
    }
  },

  _addRow: function() {
    var table = this.table.node;
    var colLen = table.childNodes.length;
    var rowLen = table.childNodes[0].childNodes.length;
    var colName = this.alphabet.makeName(rowLen-1);
    this.create('tr', table);
    this.tr.node.className = colLen.toString();
    for (var i = 0; i < rowLen; i += 1){
      this.create('td', this.tr.node);
      if (i===0) {
        this.td.node.innerHTML = colLen.toString();
      } else {
        this.td.node.className = this.alphabet.makeName(i-1, '');
      }
    }
  },

  _dataPut: function (data) {
    for (var key in data) {
      var col = key.replace(/[0-9]{1,}/,'');
      var row = key.replace(/[A-Za-z]{1,}/,'');
      console.log(row);
      console.log(document.querySelectorAll('.' + col));
      var cell = document.querySelectorAll('.' + col)[row];
      tableUI.td.lastNode = cell;
      cell.appendChild(tableUI._dataTextNode(data[key]));
      // if (data[key])
      // cell.value =
    }
  },

  initTable: function (divId) {
    this.root = divId;
    this.colNum = Math.ceil(screen.width/100) + 4;
    this.rowNum = Math.ceil(screen.height/25) + 10;
    var sheets = dataExchange.loadLocal.loadSheets();
    this.newTab();
    this.currentSheet = 'Sheet 1';
    var data = dataExchange.loadLocal.loadData('Sheet 1');
    if (data) {
      this._dataPut(data);
    }
  }
};


var tableData = {};



var dataExchange = {
  names: [],
  saveLocal: function () {
    this.names = [];
    for (var name in tableData) {
      if (tableData.hasOwnProperty( name )){
        this.names.push(name);
      }
    }
    // console.log(this.names);
    var data = JSON.stringify(tableData);
    for (var i = 0; i < this.names.length; i += 1){
      localStorage.setItem(this.names[i], data);
    }
  },
  // loadLocal: function () {
  //   console.log(Object.keys(localStorage));
  //   var res = [];
  //   Object.keys(localStorage).forEach (function(key) {
  //     if (key.indexOf('Sheet') > -1) {
  //       res.push(JSON.parse(localStorage[key]));
  //     }
  //   });
  //   return res;
  // }
  loadLocal: {
    loadSheets: function () {
      var res = Object.keys(localStorage);
      res.pop();
      return res;
    },
    loadData: function (sheet) {
      try {
        return JSON.parse(localStorage.getItem(sheet))[sheet].data;
      } catch (e) {
        return undefined;
      }
    }
  }
};

var formula = {
  evaluation: function (string) {
    var result;
    if (string.charAt(0) !== '='){
      result = string;
    } else {
      try {
        string = this.parseExpression(string);
        result = eval(string.substring(1));
      } catch (e) {
        // console.log(e);
        result = "ERROR";
      }
    }
    return result;
  },
  parseExpression: function (string) {
    var re = new RegExp("[A-Za-z]{1,}[0-9]{1,}","g");
    var cells = string.match(re);
    try {
      cells.forEach(function (cell, i, arr){
        var col = cell.replace(/[0-9]{1,}/,'');
        var row = cell.replace(/[A-Za-z]{1,}/,'');
        var cellNode = document.querySelector(".c" + row + " ." + col);
        if (isNaN(cellNode.innerHTML)){
          throw new Error("Is not a number");
        }
        string = string.replace(cell, cellNode.innerHTML);
        // console.log(string);
      });
      return string;
    } catch (e) {
      // console.log(e);
      return string;
    }
  }
};


tableUI.initTable("tableDiv");
document.getElementById('new').addEventListener('click',function(){
  tableUI.newTab();
});

document.getElementById('delete').addEventListener('click',function(){
  tableUI.removeTab();
});



// function postJSONData(path, callback) {
//   var httpRequest = new XMLHttpRequest();
//   httpRequest.onreadystatechange = function() {
//      if (httpRequest.readyState === 4) {
//           if (httpRequest.status === 200) {
//                 var data = httpRequest.responseText;
//                 if (callback) callback(data);
//             }
//         }
//     };
//   httpRequest.open('POST', path);
//   httpRequest.setRequestHeader('Content-type', 'application/json; charset=utf-8');
//   httpRequest.send(JSON.stringify({A1:1}));
// }



// postJSONData('//localhost:3000', function(data){
//     console.log(data);
// });
