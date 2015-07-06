
if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) === str;
    };
}

if (typeof String.prototype.endsWith !=='function') {
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) === str;
    };
}

if (typeof Array.prototype.remove !=='function') {
    Array.prototype.remove = function (v) {
        var index = findIndex(this, v);
        this.splice(index === -1 ? this.length : index, 1);
    };
}

if (typeof Array.prototype.findIndex !=='function') {
    Array.prototype.findIndex = function (v) {
        return findIndex(this, v);
    };
}

function findIndex(array, item)  {
    for (var i = 0; i < array.length; i++) {
        if (array[i].equals && typeof array[i].equals ==='function') {
            if (array[i].equals(item)) {
                return i;
            }
        } else if (array[i] === item) {
            return i;
        }
    }
    return -1;
}

if (typeof Array.prototype.contains !=='function') {
    Array.prototype.contains = function (v) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].equals && typeof this[i].equals ==='function') {
                if (this[i].equals(v)) {
                    return true;
                }
            } else if (this[i] === v) {
                return true;
            }
        }
        return false;
    };
}

if (typeof Array.prototype.clone !=='function') {
    Array.prototype.clone = function () {
        var result = [];
        for (var i = 0; i < this.length; i++) {
            result[i] = (this[i] instanceof Array) ? this[i].clone() : this[i];
        }
        return result;
    };
}

function findUnique(clazz, result) {
    for (var i = 0; i < clazz.length; i++) {
        if (clazz[i] instanceof Array) {
            findUnique(clazz[i], result);
        } else if (!result.contains(clazz[i])) {
            result.push(clazz[i]);
        }
    }
}

if (typeof Array.prototype.unique !=='function') {
    Array.prototype.unique = function () {
        var result = [];
        findUnique(this, result);
        return result;
    };
}

if (typeof Array.prototype.filterBy !=='function') {
    Array.prototype.filterBy = function (condition) {
        if (typeof condition !=='function') {
            return null;
        }
        var arr = [];
        findUnique(this, arr);
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            if (condition(arr[i])) {
                result.push(arr[i]);
            }
        }
        return result;
    };
}

if (typeof Array.prototype.each !=='function') {
    Array.prototype.each = function (func) {
        if (typeof func !=='function') {
            return;
        }
        var result = [];
        findUnique(this, result);
        for (var i = 0; i < result.length; i++) {
            func(result[i]);
        }
    };
}

if (typeof Array.prototype.subst !=='function') {
    Array.prototype.subst = function (func) {
        if (typeof func !=='function') {
            return;
        }
        for (var i = 0; i < this.length; i++) {
            if (this[i]  instanceof Array)  {
                this[i].subst(func);
            } else {
                this[i] = func(this[i]);
            }

        }
    };
}

function empty(value) {
    return !(value || value === 0 || isNaN(value) || !isFinite(value));
}

function number(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function Memento() {
}

function createArrayDTO(array) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
        result.push(array[i].createDTO());
    }
    return result;
}
