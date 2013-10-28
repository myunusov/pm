
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
        this.splice(this.indexOf(v) === -1 ? this.length : this.indexOf(v), 1);
    };
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

function findUnique(source, result) {
    for (var i = 0; i < source.length; i++) {
        if (source[i] instanceof Array) {
            findUnique(source[i], result);
        } else if (!result.contains(source[i])) {
            result.push(source[i]);
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