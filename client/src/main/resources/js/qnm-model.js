function Quantity() {
    this.lock = false;
    this.eval = false;
    this.inconsistent = false;

    this.beforeUpdate = function(newValue) {
        this.inconsistent = (this.eval || this.lock) ? this.asNormForm() !==newValue : false;
        this.eval = true;
        return !this.inconsistent;
    };

    this.empty = function() {
        return empty(this.value);
    };
}

function Utilization(value) {
    this.value = value;
    this.unit = 'percent';

    this.asNormForm = function () {
        if (this.empty()) {
            return null;
        }
        if (isNaN(this.value) || !isFinite(this.value)) {
            return this.value;
        }
        return this.unit === 'percent' ?
                (this.value / 100).toPrecision(5) :
                this.value;
    };
    this.asNormFormStr = function () {
        if (this.empty()) {
            return '';
        }
        return this.asNormForm();
    };
    this.asNormFormTips = function () {
        if (this.empty()) {
            return '';
        }
        return this.unit === "percent" ? this.asNormFormStr() : '';
    };
    this.setAsNormForm = function (newValue) {
        if (!this.beforeUpdate(newValue)) {
            return;
        }
        newValue = parseFloat(newValue);
        this.value = this.unit === 'rate' ? newValue : newValue * 100;
    };
    this.isValid = function () {
        return !this.inconsistent && (!this.value || this.asNormForm() < 1);
    };
}
Utilization.prototype = new Quantity();

function QNMTime(value) {
    this.value = value;
    this.unit = 'sec';

    this.asNormForm = function () {
        if (this.empty()) {
            return null;
        }
        if (isNaN(this.value) || !isFinite(this.value)) {
            return this.value;
        }
        return this.unit === 'hr' ?
                (this.value * 3600).toPrecision(5) :
                (
                        this.unit === 'min' ?
                                (this.value * 60).toPrecision(5) :
                                this.value
                        );
    };
    this.asNormFormStr = function () {
        if (this.empty()) {
            return '';
        }
        return this.asNormForm() + " sec.";
    };
    this.asNormFormTips = function () {
        if (this.empty()) {
            return '';
        }
        return this.unit === "sec" ? '' : this.asNormFormStr();
    };
    this.setAsNormForm = function (newValue) {
        if (!this.beforeUpdate(newValue)) {
            return;
        }
        newValue = parseFloat(newValue);
        this.value = this.unit === 'hr' ?
                (newValue / 3600) :
                (this.unit === 'min' ? (newValue / 60) : newValue);
    };
    this.isValid = function () {
        return !this.inconsistent && (!this.value || this.value >= 0);
    };
}
QNMTime.prototype = new Quantity();

function QNMNumber(value) {
    this.value = value;
    this.unit = 'sec';

    this.asNormForm = function () {
        return this.value;
    };
    this.setAsNormForm = function (newValue) {
        if (!this.beforeUpdate(newValue)) {
            return;
        }
        newValue = parseFloat(newValue);
        this.value = newValue;
    };

    this.isValid = function () {
        return !this.inconsistent && (!this.value || this.value >= 0);
    };
}
QNMNumber.prototype = new Quantity();

function Throughput(value) {
    this.value = value;
    this.unit = 'tps';

    this.asNormForm = function () {
        if (this.empty()) {
            return null;
        }
        if (isNaN(this.value) || !isFinite(this.value)) {
            return this.value;
        }
        return this.unit === 'tph' ?
                (this.value / 3600).toPrecision(5) :
                (
                        this.unit === 'tpm' ?
                                (this.value / 60).toPrecision(5) :
                                this.value.toPrecision(5)
                        );
    };
    this.asNormFormStr = function () {
        if (this.empty()) {
            return '';
        }
        return this.asNormForm() + " tps.";
    };
    this.asNormFormTips = function () {
        return (this.empty()) || this.unit === "tps" ? '' : this.asNormFormStr();
    };
    this.setAsNormForm = function (newValue) {
        if (!this.beforeUpdate(newValue)) {
            return;
        }
        newValue = parseFloat(newValue);
        this.value = this.unit === 'tph' ?
                (newValue * 3600) :
                (this.unit === 'tpm' ? (newValue * 60) : newValue);
    };

    this.isValid = function () {
        return !this.inconsistent && (!this.value || this.value >= 0);
    };
}
Throughput.prototype = new Quantity();

function QNMUnit() {

    this.invalid = false;
    this.lastEvalParam = null;

    this.getByName = function(name) {
        return this.all[name];
    };

    this.setValue = function (param) {
        var quantity = this.getByName(param.name);
        quantity.setAsNormForm(param.value);
        this.invalid = quantity.inconsistent;
        if (!this.invalid) {
            this.lastEvalParam = param;
        }
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

    this.getLocks = function() {
        var result = [];
        for (var name in this.all) {
            if (this.all.hasOwnProperty(name) && this.getByName(name).lock) {
                result.push(new Parameter(name, this));
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
        return (other instanceof QNMUnit) &&
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
QNMSource.prototype = new QNMUnit();

function QNMNode(id, name) {
    this.id = id;
    this.name = name || "Node " + id;
    this.utilization = new Utilization();
    this.utilizationEx = new Utilization(0);
    this.utilizationEx.lock = true;
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
QNMNode.prototype = new QNMUnit();

function QNMVisit(source, node) {
    this.id = source.id + "-" + node.id;
    this.source = source;
    this.node = node;
    this.number = new QNMNumber(1);
    this.number.lock = true;

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
QNMVisit.prototype = new QNMUnit();

function Parameter(name, unit) {
    this.name  = name;
    this.unit  = unit;
    this.value = unit ? unit.getByName(name).asNormForm() : null;


    this.isUndefined = function() {
        return empty(this.value);
    };

    this.equals = function(other) {
        return  other &&
                other instanceof Parameter &&
                other.name === this.name &&
                other.unit.equals(this.unit);
    };

    this.sync = function() {
        if (empty(this.value) || (!this.unit)) {
            return null;
        }
        this.unit.setValue(this);
        if (this.unit.invalid) {
            return null;
        }
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

function Expression(expression, unit) {

    this.expression = expression.clone();

    if (unit) {
        this.expression.subst(
                function (v) {
                    return (number(v) || v instanceof Parameter) ? v : new Parameter(v, unit);
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

    this.getFieldsSeqByChangedFieldName = function (fieldName, unit) {
        var firstParameter = new Parameter(fieldName, unit);
        if (firstParameter.isUndefined()) {
            return null;
        }
        var fields = [firstParameter];
        [this.sources, this.nodes, this.visits].each(
                function (u) {
                    var locks = u.getLocks();
                    for (var i = 0; i < locks.length; i++) {
                        if (!fields.contains(locks[i])) {
                            fields.push(locks[i]);
                        }
                    }
                }
        );
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

    this.makeCalculator = function(fieldName, unit) {
        var fields = this.getFieldsSeqByChangedFieldName(fieldName, unit);
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
