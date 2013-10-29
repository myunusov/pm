function QNMUnit(id, title, rate, pattern) {
    this.id = id;
    this.title = (title || title === '') ? title : id;
    this.rate = rate || 1;
    this.pattern = pattern || "\\d*[\\., \\,]?\\d*";

    this.equals  = function(other) {
        if (!other) {
            return null;
        }
        return (other instanceof QNMUnit) &&
                other.id === this.id;
    };
}

function Quantity() {

    this.eval = false;
    this.inconsistent = false;
    this._text;

    this.empty = function() {
        return empty(this.value);
    };

    Object.defineProperty(this, 'state', {
        get: function() {
            if (!this.valid()) {
                return "invalid"
            }
            if (this.inconsistent) {
                return "conflict"
            }
            if (this.eval) {
                return "eval"
            }
            return "";
        }
    });

    Object.defineProperty(this, 'text', {
        get: function() {
            return this._text || (number(this.value) ? (this.value / this.unit.rate).toPrecision(5) : this.value);
        },
        set: function(value) {
            this._text = value;
            this.value = number(value) ? (value * this.unit.rate).toPrecision(10) : value;
        }
    });

    this.availableUnits = function () {
        var result = [];
        if (!this.units) {
            return  result;
        }
        for (var i = 0; i < this.units.length; i++) {
            if (!this.units[i].equals(this.unit)) {
                result.push(this.units[i]);
            }
        }
        return result;
    };

    this.beforeUpdate = function(newValue) {
        this.inconsistent = this.eval ? this.value() !==newValue : false;
        this.eval = true;
        return !this.inconsistent;
    };

    this.setValue = function (newValue) {
        if (!this.beforeUpdate(newValue)) {
            return;
        }
        this.value = parseFloat(newValue).toPrecision(10);
        this._text = null;
    };

    this.setUnit = function (newValue) {
        this.unit = newValue;
        this._text = null;
    };

    this.valid = function () {
        return !this.value || (number(this.value) &&  this.value >= 0);
    };

}

function Utilization(value) {
    this.units = [
        new QNMUnit('rate'),
        new QNMUnit('percent', '%', 0.01)
    ];
    this.unit = this.units[1];
    this.value = value;
    this.valid = function () {
        return !this.value || (number(this.value) && this.value < 1 && this.value >= 0);
    };
}
Utilization.prototype = new Quantity();

function QNMTime(value) {
    this.value = value;
    this.units = [
        new QNMUnit('ms', 'ms', 0.001),
        new QNMUnit('sec'),
        new QNMUnit('min', 'min', 60),
        new QNMUnit('hr', 'hr', 3600)
    ];
    this.unit = this.units[1];
}
QNMTime.prototype = new Quantity();

function QNMNumber(value) {
    this.value = value;
    this.units = [new QNMUnit('pcs', '')];
    this.unit = this.units[0];
}
QNMNumber.prototype = new Quantity();

function Throughput(value) {
    this.value = value;
    this.units = [
        new QNMUnit('tps'),
        new QNMUnit('tpm', 'tpm', 60),
        new QNMUnit('tph', 'tph', 3600)
    ];
    this.unit = this.units[0];
}
Throughput.prototype = new Quantity();

function QNMElement() {

    this.lastEvalParam = null;

    this.getByName = function(name) {
        return this.all[name];
    };

    this.setValue = function (param) {
        var quantity = this.getByName(param.name);
        quantity.setValue(param.value);
        this.lastEvalParam = param;
    };

    this.getAll = function() {
        var result = [];
        for (var name in this.all) {
            if (this.all.hasOwnProperty(name)) {
                result.push(this.getByName(name));
            }
        }
        return result;
    };

    this.getSignificance = function() {
        var result = [];
        for (var name in this.all) {
            if (this.all.hasOwnProperty(name)) {
                var value = this.getByName(name).value;
                if (!empty(value) && isFinite(value) && !isNaN(value)) {
                    result.push(new Parameter(name, this));
                }
            }
        }
        if (this.lastEvalParam && result.contains(this.lastEvalParam.name)) {
            // move to tail
            result.remove(this.lastEvalParam.name);
            result.push(this.lastEvalParam.name);
        }
        return result;
    };

    this.equals  = function(other) {
        if (!other) {
            return null;
        }
        return (other instanceof QNMElement) &&
                other.id ===  this.id;
    };
}

function QNMSource(id, name) {
    this.id = id;
    this.name = name || "Source " + id;
    this.isOpen = true;

    this.throughput = new Throughput();
    this.thinkTime = new QNMTime();
    this.numberUsers = new QNMNumber();
    this.responseTime = new QNMTime();

    this.all = {
        'M': this.numberUsers,
        'Z': this.thinkTime,
        'X': this.throughput,
        'R': this.responseTime
    };

    this.open = function () {
        this.isOpen = true;
        this.thinkTime.value   = null;
        this.numberUsers.value = null;
    };

    this.close = function () {
        this.isOpen = false;
    };

    this.expressions = [
        new Expression([['R', 'X'], ['Z', 'X'], [-1, 'M']], this)
    ];

    this.equals  = function(other) {
        if (!other) {
            return null;
        }
        return (other instanceof QNMSource) &&
                other.id ===  this.id;
    };
}
QNMSource.prototype = new QNMElement();

function QNMNode(id, name) {
    this.id = id;
    this.name = name || "Node " + id;
    this.utilization = new Utilization();
    this.utilizationEx = new Utilization(0);
    this.all = {
        'U': this.utilization,
        'UEX': this.utilizationEx
    };
    this.expressions = [];
    this.equals  = function(other) {
        if (!other) {
            return null;
        }
        return (other instanceof QNMNode) &&
                other.id ===  this.id;
    };
}
QNMNode.prototype = new QNMElement();

function QNMVisit(source, node) {
    this.id = source.id + "-" + node.id;
    this.source = source;
    this.node = node;
    this.number = new QNMNumber(1);
    this.serviceTime = new QNMTime();
    this.utilization = new Utilization();
    this.meanNumberTasks = new QNMNumber();
    this.residenceTime = new QNMTime();
    this.throughput  = new Throughput();

    this.all = {
        'S': this.serviceTime,
        'U': this.utilization,
        'N': this.meanNumberTasks,
        'RT': this.residenceTime,
        'XI': this.throughput,
        'V': this.number
    };

    this.expressions = [
        new Expression([['V', new Parameter('X', this.source)], [-1, 'XI']], this),
        new Expression([['U'], [-1, 'XI','S']], this),
        new Expression([[-1, 'RT', 'XI'], ['N']], this)
    ];

    this.equals  = function(other) {
        if (!other) {
            return null;
        }
        return (other instanceof QNMVisit) &&
                other.id ===  this.id;
    };
}
QNMVisit.prototype = new QNMElement();

function Parameter(name, element) {
    this.name  = name;
    this.element  = element;
    this.value = element ? element.getByName(name).value : null;


    this.isUndefined = function() {
        return empty(this.value);
    };

    this.equals = function(other) {
        return  other &&
                other instanceof Parameter &&
                other.name === this.name &&
                other.element.equals(this.element);
    };

    this.sync = function() {
        if (empty(this.value) || (!this.element)) {
            return null;
        }
        this.element.setValue(this);
        return this;
    };
}

function Calculator(fields, expressions) {
    this.fields = fields;
    this.parameters = [];
    this.expressions = expressions;
    this.error = false;

    this.next = function() {
        if (this.fields.length === 0){
            return false;
        }
        var field = this.fields[0];
        this.fields.remove(field);
        return this.input(field);
    };

    this.execute = function() {
        for (var i = this.expressions.length - 1; i >= 0; i--) {
            var exp = this.expressions[i];
            var result = exp.solve(this.parameters);
            if (result) {
                this.expressions.remove(exp);
                this.error = !result.sync();
                if (!this.error) {
                    this.parameters.push(result);
                    for (var j = 0; j < this.fields.length; j++) {
                        if(this.fields[j].equals(result)) {
                            this.fields.remove(this.fields[j]);
                            break;
                        }
                    }

                }
                return result;
            }
        }
        return null;
    };

    this.input = function(param)  {
        if (this.parameters.contains(param)) {
            this.error = true;
            return null;
        }
        this.error = param.isUndefined();
        if (this.error) {
            return null;
        }
        this.parameters.push(param);
        return param;
    };


    this.last = function()  {
        return this.parameters[this.parameters.length - 1];
    };

    this.number = function()  {
        return this.parameters.length;
    };

}

function Expression(expression, element) {

    this.expression = expression.clone();

    if (element) {
        this.expression.subst(
                function (v) {
                    return (number(v) || v instanceof Parameter) ? v : new Parameter(v, element);
                }
        );
    }

    this.args = this.expression.unique().filterBy(
            function(v){
                return !number(v);
            }
    );

    this.unknown = function(params)  {
        var result = this.args.filterBy(
                function(v){
                    return !params.contains(v);
                }
        );
        if (result && result.length === 1) {
            return result[0];
        }
        return null;
    };

    function calculateFactor(term, params) {
        var result = 1;
        for (var i = 0; i < term.length; i++) {
            for (var j = 0; j < params.length; j++) {
                if (params[j].equals(term[i])) {
                    result *= params[j].value;
                    break;
                }
            }
            if (number(term[i])) {
                result *= term[i];
            }
        }
        return result;
    }

    this.solve = function(params) {
        var x = this.unknown(params);
        if (!x) {
            return null;
        }
        var mult = 0;
        var term = 0;
        for (var i = 0; i < this.expression.length; i++) {
            var factor = calculateFactor(this.expression[i], params);
            if (this.expression[i].contains(x)) {
                mult = parseFloat((mult + factor).toPrecision(10));
            } else {
                term = parseFloat((term - factor).toPrecision(10));
            }
        }
        x.value = term / mult;
        return x;
    };
}


function QNM(name) {

    this.name = name;
    this.sources = [];
    this.nodes = [];
    this.visits = [];

    var sourcesNo = 0;
    var nodeNo = 0;

    this.addSource = function () {
         var source = new QNMSource(++sourcesNo);
         this.sources.push(source);
         for (var i = 0; i < this.nodes.length; i++) {
         this.visits.push(new QNMVisit(source, this.nodes[i]));
         }
    };
    this.removeSource = function (source) {
         this.sources.remove(source);
         for (var i = 0; i < this.nodes.length; i++) {
         var visit = this.getVisitBy(source, this.nodes[i]);
         this.visits.remove(visit);
         }
    };
    this.addNode = function () {
        var node = new QNMNode(++nodeNo);
        this.nodes.push(node);
        for (var i = 0; i < this.sources.length; i++) {
         this.visits.push(new QNMVisit(this.sources[i], node));
         }
    };
    this.removeNode = function (node) {
        this.nodes.remove(node);
        for (var i = 0; i < this.sources.length; i++) {
         this.visits.remove(this.getVisitBy(this.sources[i], node));
         }
    };

    this.getVisitBy = function(source, node) {
        for (var i = 0; i < this.visits.length; i++) {
            if (this.visits[i].source === source && this.visits[i].node === node) {
                return this.visits[i];
            }
        }
        return null;
    };

    this.getVisitsBySource = function(source) {
        var result = [];
        for (var i = 0; i < this.visits.length; i++) {
            if (this.visits[i].source === source) {
                result.push(this.visits[i]);
            }
        }
        return result;
    };

    this.getVisitsByNode = function(node) {
        var result = [];
        for (var i = 0; i < this.visits.length; i++) {
            if (this.visits[i].node === node) {
                result.push(this.visits[i]);
            }
        }
        return result;
    };

    this.getFieldsSeqBy = function (changedFields) {
        var fields = changedFields.clone().reverse();

        [this.sources, this.nodes, this.visits].each(
                function (u) {
                    var notEmpty = u.getSignificance();
                    for (var i = 0; i < notEmpty.length; i++) {
                        if (!fields.contains(notEmpty[i])) {
                            fields.push(notEmpty[i]);
                        }
                    }
                }
        );
        return fields;
    };

    this.makeRXNExps = function(source) {
        var result = [[new Parameter('R', source), new Parameter('X', source)]];
        var visits = this.getVisitsBySource(source);
        for (var j = 0; j < visits.length; j++) {
            if (visits[j].number.value) {
                result.push([-1, new Parameter('N', visits[j])]);
            }
        }
        return new Expression(result);
    };

    this.makeUUEXExp = function(node) {
        var result = [[-1, new Parameter('U', node)], [new Parameter('UEX', node)]];
        var visits = this.getVisitsByNode(node);
        for (var j = 0; j < visits.length; j++) {
            if (visits[j].number.value) {
                result.push([new Parameter('U', visits[j])]);
            }
        }
        return new Expression(result);
    };

    this.makeUUEXNExp = function(source, node) {
        var visit = this.getVisitBy(source, node);
        var result = [
            [new Parameter('U', visit)],
            [-1, new Parameter('N', visit)],
            [new Parameter('UEX', node), new Parameter('N', visit)]
        ];
        var visits = this.getVisitsByNode(node);
        for (var j = 0; j < visits.length; j++) {
            result.push([new Parameter('U', visits[j]), new Parameter('N', visit)]);
        }
        return new Expression(result);
    };

    this.makeRTUSExp = function(source, node) {
        var visit = this.getVisitBy(source, node);
        var result = [
            [-1, new Parameter('RT', visit)],
            [new Parameter('S', visit)],
            [new Parameter('UEX', node), new Parameter('RT', visit)]
        ];
        var visits = this.getVisitsByNode(node);
        for (var j = 0; j < visits.length; j++) {
            result.push([new Parameter('U', visits[j]), new Parameter('RT', visit)]);
        }
        return new Expression(result);
    };

    // new Expression([['RT'],[-1, 'RT',new Parameter('U', this.node)],[-1, 'S']], this),


    this.makeExpressions = function () {
        var result = [];
        for (var i = 0; i < this.sources.length; i++) {
            result.push(this.makeRXNExps(this.sources[i]));
        }
        for (var j = 0; j < this.nodes.length; j++) {
            result.push(this.makeUUEXExp(this.nodes[j]));
        }
        for (var i1 = 0; i1 < this.sources.length; i1++) {
            for (var j1 = 0; j1 < this.nodes.length; j1++) {
                result.push(this.makeUUEXNExp(this.sources[i1], this.nodes[j1]));
                result.push(this.makeRTUSExp(this.sources[i1], this.nodes[j1]));
            }
        }
        return result;
    };

    this.getExpressions = function () {
        var expressions = [];
        [this.sources, this.visits, this.nodes].each(
                function (u) {
                    expressions = expressions.concat(u.expressions);
                }
        );
        expressions = expressions.concat(this.makeExpressions());
        return expressions;
    };

    this.makeCalculator = function(changedFields) {
        var fields = this.getFieldsSeqBy(changedFields);
        if (!fields) {
            return null;
        }
        var expressions = this.getExpressions();
        if (!expressions) {
            return null;
        }
        return new Calculator(fields, expressions);
    };

    this.init = function() {
        [this.sources, this.visits, this.nodes].each(
                function (u) {
                    var all = u.getAll();
                    for (var j = 0; j < all.length; j++) {
                        all[j].eval = false;
                        all[j].inconsistent = false;
                    }
                }
        );
    };


}
