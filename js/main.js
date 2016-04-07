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
            var text = this.childNodes[0].data;
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
          tableUI.tr.lastNode = this.parentNode;
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
      if (tableUI.tr.lastNode) {
        tableUI.tr.lastNode.removeAttribute('data-active');
      }
      if (tableUI.td.lastNode) {
        var col = document.querySelectorAll('.' + tableUI.td.lastNode.className);
        tableUI.td.lastNode.removeAttribute('data-active');
        if (tableUI.td.lastNode.childNodes[0]){
          var text = tableUI.td.lastNode.childNodes[0].value || tableUI.td.lastNode.childNodes[0].data;
          tableUI.td.lastNode.removeChild(tableUI.td.lastNode.childNodes[0]);
          if (text) {
            tableUI.td.lastNode.appendChild(document.createTextNode(text));
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
        var rowNum = parseInt(element.parentElement.className);
        var colName = element.className;
        var col = document.querySelectorAll('.' + colName);
        var table = document.querySelector('table');
        console.log(event.target);
        if (event.keyCode === UI.keyCodes.ENTER) {
          if (event.target.tagName === 'INPUT'){
            UI.mouseEvents._disableActive();
          } else {
            if (rowNum > 0) {
              UI.mouseEvents._cellClick.bind(element)();
            }

          }

        } else if (event.keyCode === tableUI.keyCodes.DOWN_ARROW) {
          if (element.parentElement.hasAttribute("data-active")){
            UI.mouseEvents._rowClick().bind(col[rowNum + 1])();
            console.log(col[rowNum + 1]);
          } else {
            UI.mouseEvents._cellClick().bind(col[rowNum + 1])();
          }

        } else if (event.keyCode === tableUI.keyCodes.UP_ARROW) {

          if (rowNum > 0) {
            UI.mouseEvents._cellClick().bind(col[rowNum - 1])();
          }
          if (rowNum === 1) {
            UI.mouseEvents._colClick().bind(col[rowNum - 1])();
          }

        } else if (event.keyCode === tableUI.keyCodes.LEFT_ARROW) {

          if (element.previousSibling){
            if (element.previousSibling.className) {
              if (col[1].hasAttribute("data-active-col")) {
                UI.mouseEvents._colClick().bind(element.previousSibling)();
              } else {
                UI.mouseEvents._cellClick().bind(element.previousSibling)();
              }
            } else {
              UI.mouseEvents._rowClick().bind(element.previousSibling)();
            }


          }

        } else if (event.keyCode === tableUI.keyCodes.RIGHT_ARROW) {
          tableUI.mouseEvents._disableActive(this);
          tableUI.keyboardEvents.colLetter = tableUI.alphabet.ALPHABET[tableUI.alphabet.ALPHABET.indexOf(this.className)+1];
          tableUI.keyboardEvents.column = document.getElementsByClassName(tableUI.keyboardEvents.colLetter);
          tableUI.keyboardEvents.rowNum = parseInt(this.parentElement.className);
          tableUI.mouseEvents._cellClick ().bind(tableUI.keyboardEvents.column[tableUI.keyboardEvents.rowNum])();
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
    this.newTable(40, 15);
    this.div._addEvent('click', tableUI._tabClick());
    tableData['Sheet'+number] = {rows:40, cols:15, data:{}};
  },

  _tabClick: function () {
    return function() {
      if (!this.children[0].checked){
        tableUI.newTable(40, 15);
        tableUI.div.node = this;
      }
    };
  },

  removeTab: function () {
    var div = tableUI.div.node.previousSibling || tableUI.div.node.nextSibling;

    if (div) {
      document.querySelectorAll('.tabs')[0].removeChild(tableUI.div.node);
        tableUI._tabClick().bind(div)();
        div.children[0].checked = true;
    }

  },

  newTable: function (){
    var cols = Math.ceil(screen.width/100) + 4;
    var rows = Math.ceil(screen.height/100) + 10;
    console.log(rows, cols);
    var div = document.getElementById(this.root);
    if (div.firstChild) {
      div.removeChild(div.firstChild);
    }
    this.create('table', div);
    window.addEventListener('keydown', this.keyboardEvents._onCells);
    this.table._addEvent('click', this.mouseEvents._cell);
    for (var i = 0; i <= rows; i += 1){
      this.create('tr', this.table.node);
      this.tr.node.className = i.toString();
      for (var j=0; j <= cols; j += 1){
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
        // this.td._addEvent('click', this.mouseEvents._rowClick());
      } else {
        this.td.node.className = this.alphabet.makeName(i-1, '');
        // this.td._addEvent('keydown', this.keyboardEvents._onCells());
      }

    }

  },
  initTable: function (divId) {
    this.root = divId;
    this.newTab();
  }
};


var tableData = {

};


tableUI.initTable("tableDiv");
document.getElementById('new').addEventListener('click',function(){
  tableUI.newTab();
});

document.getElementById('delete').addEventListener('click',function(){
  tableUI.removeTab();
});



function postJSONData(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
     if (httpRequest.readyState === 4) {
          if (httpRequest.status === 200) {
                var data = httpRequest.responseText;
                if (callback) callback(data);
            }
        }
    };
  httpRequest.open('POST', path);
  httpRequest.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  httpRequest.send(JSON.stringify({A1:1}));
}



postJSONData('//localhost:3000', function(data){
    console.log(data);
});
