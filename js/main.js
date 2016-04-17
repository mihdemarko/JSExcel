'use strict';

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

function arraySelector(selector) {
    var arr = Array.prototype.slice.call(document.querySelectorAll(selector));
    return arr;
}



class Table {
    constructor(divId) {
        this.divId = '#' + divId;
    }

    static get ALPHABET() {
        return 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
    }
    static makeName(num, str = '') {
        if (num < 26) {
            str = this.ALPHABET[num] + str;
            return str;
        } else {
            str = this.ALPHABET[num % 26] + str;
            return this.makeName(Math.floor(num / 26) - 1, str);
        }
    }
    get node() {
        return this.currentNode;
    }

    set node(node) {
        let col;
        let row;
        let element = this.currentNode || node;
        let isSame = node === element;
        let textNode = document.createTextNode('');
        if (element) {
            if (element.className) {
                col = arraySelector('.' + element.className);
            }
            row = element.parentElement;
            if (row.hasAttribute('data-active') && !element.className) {
                console.log('removed');
                row.removeAttribute('data-active');
            }
            element.removeAttribute('data-active');
            if (!isSame && element.childNodes[0] && element.childNodes[0].tagName === "INPUT") {
                var text = element.childNodes[0].value || element.childNodes[0].data;
                element.removeChild(element.childNodes[0]);
                if (text) {
                    textNode.data = text;
                    textNode.value = text;
                    element.appendChild(textNode);
                }
            }
        }

        if (col && col[1].hasAttribute("data-active-col") && element === col[0]) {
            col.forEach((val) => {
                val.removeAttribute('data-active-col');
            });
        }
        this.currentNode = node;
        this.currentNode.setAttribute('data-active', '')
    }

    _rowGen() {
        return function* () {
            let table = document.querySelector('table');
            let n = 0
            while (true) {
                let cols = document.querySelectorAll('tr:first-child td');
                let tr = document.createElement('tr');
                let td = document.createElement('td');
                tr.appendChild(td);
                if (n > 0) {
                    td.innerHTML = n;
                }
                if (cols.length > 1) {
                    Array.prototype.forEach.call(cols, (cols, i) => {
                        if (i > 0) {
                            let td = document.createElement('td');
                            tr.appendChild(td);
                        }
                    });
                }
                tr.className = 'c' + n.toString();
                table.appendChild(tr);
                n += 1;
                yield;
            }
        }
    }
    _colGen() {
        return function* generator() {
            let n = 0;
            while (true) {
                let trs = document.querySelectorAll('tr');
                Array.prototype.forEach.call(trs, function (tr, i) {
                    let td = document.createElement('td');
                    td.className = Table.makeName(n);
                    if (i === 0) {
                        td.innerHTML = td.className;
                    }
                    tr.appendChild(td);
                })
                n += 1;
                yield;
            }
        }
        let gen = generator();
    }
    _intitDimensions() {
        let rows = Math.ceil(screen.height / 25) + 10;
        let cols = Math.ceil(screen.width / 100) + 4;
        return [rows, cols];
    }
    deploy(rows = this._intitDimensions()[0], cols = this._intitDimensions()[1]) {
        this.table = document.createElement('table');
        document.querySelector(this.divId).appendChild(this.table);
        this.rowGen = this._rowGen()();
        this.colGen = this._colGen()();
        range(rows).forEach(() => this.rowGen.next());
        range(cols).forEach(() => this.colGen.next());
        this.mouseEvents = new MouseEvents(this);
        let scrollEvents = new ScrollEvents(this);
        window.addEventListener("scroll", scrollEvents._horisontalAdd);
        window.addEventListener("scroll", scrollEvents._verticalAdd);
        return this;
    }
    addEvent(eventName, func) {
        this.table.addEventListener(eventName, func);
        return this;
    }
};


class MouseEvents {
    constructor(table) {
        this.table = table;
    }
    cell(event) {
        let target = event.target;
        let firstRow = document.querySelector('table').firstChild;
        let firstCell = target.parentElement.firstChild;
        while (target !== this) {
            if (target.tagName == 'TD') {
                if (target.parentElement === firstRow && target !== firstCell) {
                    this._colClick.apply(target, [this.table]);
                } else if (target === firstCell) {
                    this._rowClick.apply(target, [this.table]);
                } else {
                    this._cellClick.apply(target, [this.table]);
                }
                return;
            }
            target = target.parentNode;
        }
    }
    _cellClick() {
        let table = arguments[0];
        let input = document.createElement('input');
        if (this.childNodes.length === 0 && this.hasAttribute("data-active")) {
            this.appendChild(input);
            input.focus();
        } else {
            if (this.childNodes[0] && this.childNodes[0].data) {
                var text = this.childNodes[0].value;
                this.removeChild(this.childNodes[0]);
                input.value = text;
                this.appendChild(input);
                input.focus();
            }
        }
        table.node = this;
    }

    _rowClick() {
        if (!this.parentNode.hasAttribute("data-active")) {
            this.parentNode.setAttribute('data-active', '');
            table.node = this;
        }
    }

    _colClick() {
        var col = arraySelector('.' + this.className);
        if (!col[1].hasAttribute("data-active-col")) {
            col.forEach(function (val) {
                val.setAttribute('data-active-col', '');
            });
            table.node = this;
        }
    }
};

class ScrollEvents {
    constructor(table) {
        this.table = table;
    }
    _horisontalAdd() {
        let tr = document.querySelector("tr:first-child");
        tr.style.left = 30 - document.body.scrollLeft + 'px';
        if (table.table.clientWidth < document.body.scrollLeft + screen.width) {
            console.log('working')
            table.colGen.next();
        }
    }
    _verticalAdd() {
        let td = document.body.querySelectorAll("td:first-child");
        [].forEach.call(td, function (td, i) {
            td.style.top = 25 * i + 30 - document.body.scrollTop + 'px';
        });
        if (table.table.clientHeight < document.body.scrollTop + screen.height) {
            table.rowGen.next();
        }
    }
}



let table = new Table('tableDiv');
table.deploy().addEvent('click', table.mouseEvents.cell.bind(table.mouseEvents))
