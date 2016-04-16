'use strict';

//Helper functions

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

Object.method('objectForEach', function (func) {
    return Object.keys(this).forEach(func);
});


function arraySelector(selector) {
    var arr = Array.prototype.slice.call(document.querySelectorAll(selector));
    return arr;
}

function range(start, end, step) {
    var ret = [];
    if (arguments.length === 1) {
        end = start;
        start = 0;
    }
    end = end || 0;
    step = step || 1;
    for (ret;
        (end - start) * step > 0; start += step) {
        ret.push(start);
    }
    return ret;
}




var tableUI = {
    alphabet: {
        ALPHABET: (function () {
            var alph = 'abcdefghijklmnopqrstuvwxyz';
            alph = alph.toUpperCase().split('');
            return alph;
        }()),
        makeName: function (num, str) {
            if (isNaN(num)) {
                return null;
            }
            if (!str) {
                str = '';
            }
            if (num < 26) {
                str = this.ALPHABET[num] + str;
                return str;
            } else {
                str = this.ALPHABET[num % 26] + str;
                return this.makeName(Math.floor(num / 26) - 1, str);
            }
        }
    },
    col: {},
    currentSheet: 'Sheet 1',

    _dataTextNode: function (text) {

        var dataNode = document.createTextNode(text);
        Object.defineProperty(dataNode, 'value', {
            get: function () {
                return this.val;
            },
            set: function (data) {
                var element = tableUI.td.lastNode;
                var cellName = element.className + element.parentElement.className.replace('c', '');
                this.val = data;
                tableData[tableUI.currentSheet].data[cellName] = data;
                console.log(data)
                dataExchange.saveLocal(tableData);
            }
        });
        dataNode.value = text;
        dataNode.data = formula.evaluation(text);
        return dataNode;

    },


    mouseEvents: {
        _cell: function (event) {
            var target = event.target;
            var firstRow = document.querySelector('table').firstChild;
            // var firstCol = document.querySelectorAll('tr:first-child');
            var firstCell = target.parentElement.firstChild;
            while (target !== this) {
                if (target.tagName == 'TD') {
                    if (target.parentElement === firstRow && target !== firstCell) {
                        tableUI.mouseEvents._colClick.bind(target)();
                    } else if (target === firstCell) {
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
            if (!this.hasAttribute("data-active")) {
                tableUI.mouseEvents._disableActive();
                this.setAttribute('data-active', '');
                tableUI.td.lastNode = this;
            } else if (this.childNodes.length === 0) {
                tableUI.create('input', this);
                tableUI.input.node.focus();
            } else {
                if (this.childNodes[0].data) {
                    var text = this.childNodes[0].value;
                    this.removeChild(this.childNodes[0]);
                    tableUI.create('input', this);
                    tableUI.input.node.value = text;
                    tableUI.input.node.focus();
                }
            }
        },

        _rowClick: function () {
            if (!this.parentNode.hasAttribute("data-active")) {
                tableUI.mouseEvents._disableActive();
                this.parentNode.setAttribute('data-active', '');
                tableUI.td.lastNode = this;
            }
        },

        _colClick: function () {
            var col = arraySelector('.' + this.className);
            if (!col[1].hasAttribute("data-active-col")) {
                tableUI.mouseEvents._disableActive();
                col.forEach(function (val) {
                    val.setAttribute('data-active-col', '');
                });
                tableUI.td.lastNode = col[0];
            }
        },

        _disableActive: function () {
            var col;
            var row;
            var element = tableUI.td.lastNode;
            if (element) {
                if (element.className) {
                    col = arraySelector('.' + element.className);
                }
                row = element.parentElement;
                if (row.hasAttribute('data-active')) {
                    row.removeAttribute('data-active');
                }
                element.removeAttribute('data-active');
                if (element.childNodes[0] && element.childNodes[0].tagName === "INPUT") {
                    var text = element.childNodes[0].value || element.childNodes[0].data;
                    element.removeChild(element.childNodes[0]);
                    if (text) {
                        element.appendChild(tableUI._dataTextNode(text));
                    }
                }
            }

            if (col && col[1].hasAttribute("data-active-col")) {
                col.forEach(function (val) {
                    val.removeAttribute('data-active-col');
                });
            }
        }
    },

    keyCodes: {
        ENTER: 13,
        RIGHT_ARROW: 39,
        LEFT_ARROW: 37,
        UP_ARROW: 38,
        DOWN_ARROW: 40
    },

    keyboardEvents: {
        _onCells: function (event) {
            var UI = tableUI;
            var element = tableUI.td.lastNode;
            if (!element) {
                return;
            }
            var row = element.parentElement;
            var rowNum = parseInt(row.className.replace('c', ''));
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
                if (sibling) {
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
                    if (isFirstChild) {
                        UI.mouseEvents._rowClick.bind(colSibling)();
                    } else if (colSibling.parentElement === table.firstChild) {
                        UI.mouseEvents._colClick.bind(colSibling)();
                    } else {
                        UI.mouseEvents._cellClick.bind(colSibling)();
                    }
                }
            };

            if (event.keyCode === UI.keyCodes.ENTER) {
                if (event.target.tagName === 'INPUT') {
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
                if (screen.height - element.getBoundingClientRect().top < 250) {
                    document.body.scrollTop += 25;
                }


            } else if (event.keyCode === tableUI.keyCodes.UP_ARROW) {
                _upDown(col[rowNum - 1]);
                event.preventDefault();
                if (element.getBoundingClientRect().top < 100) {
                    document.body.scrollTop -= 25;
                }

            } else if (event.keyCode === tableUI.keyCodes.LEFT_ARROW) {
                _leftRight(element.previousSibling);
                if (event.target.tagName !== "INPUT") {
                    event.preventDefault();
                    if (element.getBoundingClientRect().left < 200) {
                        document.body.scrollLeft -= 100;
                    }
                }

            } else if (event.keyCode === tableUI.keyCodes.RIGHT_ARROW) {
                _leftRight(element.nextSibling);
                if (event.target.tagName !== "INPUT") {
                    event.preventDefault();
                    if (screen.width - element.getBoundingClientRect().left < 300) {
                        document.body.scrollLeft += 100;
                    }

                }

            }
        }
    },

    scrollEvents: {
        _horisontalAdd: function () {
            var tr = document.body.querySelector("tr:first-child");
            tr.style.left = 30 - document.body.scrollLeft + 'px';
            if (tableUI.table.node.clientWidth < document.body.scrollLeft + screen.width) {
                tableUI._addCol();
            }
        },
        _verticalAdd: function () {
            var td = document.body.querySelectorAll("td:first-child");
            [].forEach.call(td, function (td, i) {

                td.style.top = 25 * i + 30 - document.body.scrollTop + 'px';


            });
            if (tableUI.table.node.clientHeight < document.body.scrollTop + screen.height) {
                tableUI._addRow();
            }
        }
    },

    newTab: function () {
        dataExchange.saveLocal(tableData);
        var tabs = document.querySelectorAll(".tabs")[0];
        var number = tabs.children.length + 1;
        number = number.toString();
        if (tabs.lastChild) {
            var n = parseInt(tabs.lastChild.firstChild.id.replace('tab-', ''));
            if (parseInt(number - 1) !== n) {
                number = n + 1;
                number = number.toString();
            }
        }
        this.create('div', tabs);
        this.div.node.className = "tab";
        this.create('input', this.div.node);
        this.input.node.setAttribute('type', 'radio');
        this.input.node.setAttribute('name', 'tab-group-1');
        this.input.node.checked = true;
        this.input.node.id = 'tab-' + number;
        // var last = tabs.children[tabs.children.length - 1].firstChild;
        this.create('label', this.div.node);
        this.label.node.innerHTML = 'Sheet ' + number;
        this.label.node.setAttribute('for', this.input.node.id);
        this.newTable();
        this.div._addEvent('click', tableUI._tabClick);
        this.currentSheet = 'Sheet ' + number;
        tableData = {};
        tableData['Sheet ' + number] = {
            rows: Math.ceil(screen.height / 25) + 10,
            cols: Math.ceil(screen.width / 100) + 4,
            data: {}
        };
        var data = dataExchange.loadLocal.loadData(this.currentSheet);
        if (data) {
            this._dataPut(data);
        }

        // console.log(tableData);
    },

    _tabClick: function () {
        if (!this.children[0].checked) {
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

    newTable: function () {
        var div = document.getElementById(this.root);
        if (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        this.create('table', div);
        window.addEventListener('keydown', this.keyboardEvents._onCells);
        this.table._addEvent('click', this.mouseEvents._cell);
        range(tableUI.rowNum + 1).forEach(function (val, i) {
            tableUI.create('tr', tableUI.table.node);
            tableUI.tr.node.className = 'c' + i.toString();
            range(tableUI.colNum + 1).forEach(function (val, j) {
                tableUI.create('td', tableUI.tr.node);
                if (j > 0) {
                    tableUI.td.node.className = tableUI.alphabet.makeName(j - 1, '');
                    if (i === 0) {
                        tableUI.td.node.innerHTML = tableUI.td.node.className;
                    }
                }
                if (j === 0 && i > 0) {
                    tableUI.td.node.innerHTML = i;
                }
            });
        });
        window.addEventListener("scroll", this.scrollEvents._horisontalAdd);
        window.addEventListener("scroll", this.scrollEvents._verticalAdd);
    },

    create: function (element, parentElement, before) {
        if (this[element] && this[element].tag) {
            this[element].node = document.createElement(this[element].tag);
        } else {
            this[element] = {};
            this[element].tag = element;
            this[element]._addEvent = function (eventName, func) {
                if (this.node) {
                    this.node.addEventListener(eventName, func);
                }
            };
            this[element].node = document.createElement(element);
        }
        if (!before) {
            if (parentElement) {
                if (typeof parentElement === 'string') {
                    document.getElementById(parentElement).appendChild(this[element].node);
                } else if (parentElement.hasOwnProperty('node')) {
                    parentElement.node.appendChild(this[element].node);
                } else {
                    parentElement.appendChild(this[element].node);
                }
            }
        } else {
            if (parentElement) {
                var child;
                var parent;
                if (typeof parentElement === 'string') {
                    child = document.getElementById(parentElement);
                    parent = child.parentElement;
                    parent.insertBefore(this[element].node, child);
                } else if (parentElement.hasOwnProperty('node')) {
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

    _addCol: function () {
        var table = this.table.node;
        var colLen = table.childNodes.length;
        var rowLen = table.childNodes[0].childNodes.length;
        var colName = this.alphabet.makeName(rowLen - 1);
        range(colLen).forEach(function (val, i) {
            tableUI.create('td', tableUI.table.node.childNodes[i]);
            tableUI.td.node.className = colName;
            if (i === 0) {
                tableUI.td.node.innerHTML = colName;
            }
        });
    },

    _addRow: function () {
        var table = this.table.node;
        var colLen = table.childNodes.length;
        var rowLen = table.childNodes[0].childNodes.length;
        var colName = this.alphabet.makeName(rowLen - 1);
        this.create('tr', table);
        this.tr.node.className = colLen.toString();
        range(rowLen).forEach(function (val, i) {
            tableUI.create('td', tableUI.tr.node);
            if (i === 0) {
                tableUI.td.node.innerHTML = colLen.toString();
            } else {
                tableUI.td.node.className = tableUI.alphabet.makeName(i - 1, '');
            }
        });
    },

    _dataPut: function (data) {
        data.objectForEach(function (key) {
            var col = key.replace(/[0-9]{1,}/, '');
            var row = key.replace(/[A-Za-z]{1,}/, '');
            var cell = document.querySelectorAll('.' + col)[row];
            tableUI.td.lastNode = cell;
            cell.appendChild(tableUI._dataTextNode(data[key]));
        });
    },

    initTable: function (divId) {
        this.root = divId;
        this.colNum = Math.ceil(screen.width / 100) + 4;
        this.rowNum = Math.ceil(screen.height / 25) + 10;
        var sheets = dataExchange.loadLocal.loadSheets();
        this.newTab();
        this.currentSheet = 'Sheet 1';
        // var data = dataExchange.loadLocal.loadData('Sheet 1');
        // if (data) {
        //     this._dataPut(data);
        // }
    }
};


var tableData = {};



var dataExchange = {
    names: [],
    saveLocal: function () {
        dataExchange.names = [];
        tableData.objectForEach(function (key) {
            dataExchange.names.push(key);
        })
        var data = JSON.stringify(tableData);
        dataExchange.names.forEach(function (val) {
            localStorage.setItem(val, data);
        })
    },

    loadLocal: {
        loadSheets: function () {
            var res = Object.keys(localStorage);
            res.pop();
            return res;
        },
        loadData: function (sheet) {
            try {
                console.log(JSON.parse(localStorage.getItem(sheet))[sheet].data)
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
        if (string.charAt(0) !== '=') {
            result = string;
        } else {
            try {
                string = this.parseExpression(string);
                result = eval(string.substring(1));
            } catch (e) {
                result = "ERROR";
            }
        }
        return result;
    },
    parseExpression: function (string) {
        var re = new RegExp("[A-Za-z]{1,}[0-9]{1,}", "g");
        var cells = string.match(re);
        try {
            cells.forEach(function (cell) {
                var col = cell.replace(/[0-9]{1,}/, '');
                var row = cell.replace(/[A-Za-z]{1,}/, '');
                var cellNode = document.querySelector(".c" + row + " ." + col);
                if (isNaN(cellNode.innerHTML)) {
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
document.getElementById('new').addEventListener('click', function () {
    tableUI.newTab();
});

document.getElementById('delete').addEventListener('click', function () {
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
