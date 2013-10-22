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


function Quantity() {
    this.lock = false;
    this.inconsistent = false;

    this.check = function(newValue) {
        this.inconsistent = this.lock ? this.asNormForm() !==newValue : false;
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
        if (!this.check(newValue)) {
            return;
        }
        newValue = parseFloat(newValue);
        this.value = this.unit === 'rate' ? newValue : newValue * 100;
    };
    this.isValid = function () {
        return !this.value || this.asNormForm() < 1;
    };
}
Utilization.prototype = new Quantity();

function PMTime(value) {
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
        if (!this.check(newValue)) {
            return;
        }
        newValue = parseFloat(newValue);
        this.value = this.unit === 'hr' ?
                        (newValue / 3600) :
                        (this.unit === 'min' ? (newValue / 60) : newValue);
    };
    this.isValid = function () {
        return !this.value || this.value >= 0;
    };
}
PMTime.prototype = new Quantity();

function PMNumber(value) {
    this.value = value;
    this.unit = 'sec';

    this.asNormForm = function () {
        return this.value;
    };
    this.setAsNormForm = function (newValue) {
        if (!this.check(newValue)) {
            return;
        }
        newValue = parseFloat(newValue);
        this.value = newValue;
    };

    this.isValid = function () {
        return !this.value || this.value >= 0;
    };
}
PMNumber.prototype = new Quantity();

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
        if (!this.check(newValue)) {
            return;
        }
        newValue = parseFloat(newValue);
        this.value = this.unit === 'tph' ?
                        (newValue * 3600) :
                        (this.unit === 'tpm' ? (newValue * 60) : newValue);
    };

    this.isValid = function () {
        return !this.value || this.value >= 0;
    };
}
Throughput.prototype = new Quantity();

function PMUnit() {

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
        return (other instanceof PMUnit) &&
                other.id ===  this.id;
    };
}

function PMSource(id) {

    this.id = id;
    this.name = "Source " + id;
    this.isOpen = true;

    this.throughput = new Throughput();
    this.thinkTime = new PMTime();
    this.numberUsers = new PMNumber();
    this.responseTime = new PMTime();

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
        return (other instanceof PMSource) &&
                other.id ===  this.id;
    };
}
PMSource.prototype = new PMUnit();

function PMNode(id) {
    this.id = id;
    this.name = "Node " + id;
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
        return (other instanceof PMNode) &&
                other.id ===  this.id;
    };
}
PMNode.prototype = new PMUnit();

function PMVisit(source, node) {
    this.id = source.id + "-" + node.id;
    this.source = source;
    this.node = node;
    this.number = new PMNumber(1);

    this.serviceTime = new PMTime();
    this.utilization = new Utilization();
    this.meanNumberTasks = new PMNumber();
    this.residenceTime = new PMTime();
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
        new Expression([['U'],[new Parameter('U', this.node),'N'],[-1, 'N']], this),
        new Expression([['U'], [-1, 'XI','S']], this),
        new Expression([['RT'],[-1, 'RT',new Parameter('U', this.node)],[-1, 'S']], this),
        new Expression([[-1, 'RT', 'XI'], ['N']], this)
    //    ,new Expression([['S', 'N'],['S'], [-1, 'RT']], this) TODO
    ];

    this.equals  = function(other) {
        if (!other) {
            return null;
        }
        return (other instanceof PMVisit) &&
                other.id ===  this.id;
    };
}
PMVisit.prototype = new PMUnit();


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

function Model() {
    this.sources = [];
    this.nodes = [];
    this.visits = [];
    var sourcesNo = 0;
    var nodeNo = 0;

    this.getVisitBy = function(source, node) {
        for (var i = 0; i < this.visits.length; i++) {
            if (this.visits[i].source == source && this.visits[i].node == node) {
                return this.visits[i];
            }
        }
        return null;
    };

    this.getVisitsBySource = function(source) {
        var result = [];
        for (var i = 0; i < this.visits.length; i++) {
            if (this.visits[i].source == source) {
                result.push(this.visits[i]);
            }
        }
        return result;
    };

    this.getVisitsByNode = function(node) {
        var result = [];
        for (var i = 0; i < this.visits.length; i++) {
            if (this.visits[i].node == node) {
                result.push(this.visits[i]);
            }
        }
        return result;
    };

    this.addSource = function () {
        var source = new PMSource(++sourcesNo);
        this.sources.push(source);
        for (var i = 0; i < this.nodes.length; i++) {
            this.visits.push(new PMVisit(source, this.nodes[i]));
        }
    };
    this.removeSource = function (source) {
        this.sources.remove(source);
        for (var i = 0; i < this.nodes.length; i++) {
            var visit = getVisitBy(source, this.nodes[i]);
            this.visits.remove(visit);
        }
    };
    this.addNode = function () {
        var node = new PMNode(++nodeNo);
        this.nodes.push(node);
        for (var i = 0; i < this.sources.length; i++) {
            this.visits.push(new PMVisit(this.sources[i], node));
        }
    };
    this.removeNode = function (node) {
        this.nodes.remove(node);
        for (var i = 0; i < this.sources.length; i++) {
            this.visits.remove(getVisitBy(this.sources[i], node));
        }
    };

    this.getFieldsSeqByChangedFieldName = function (fieldName, unit) {
        var firstParameter = new Parameter(fieldName, unit);
        if (firstParameter.isUndefined()) {
            return null;
        }
        var fields = [firstParameter];
        [this.nodes, this.sources, this.visits].each(
                function (u) {
                    var locks = u.getLocks();
                    for (var i = 0; i < locks.length; i++) {
                        if (!fields.contains(locks[i])) {
                            fields.push(locks[i]);
                        }
                    }
                }
        );
        [this.nodes, this.sources, this.visits].each(
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

    this.makeExpressions = function () {
        var result = [];
        for (var i = 0; i < this.sources.length; i++) {
            result.push(this.makeRXNExps(this.sources[i]));
        }
        for (var j = 0; j < this.nodes.length; j++) {
            result.push(this.makeUUEXExp(this.nodes[j]));
        }
        return result;
    };

    this.getExpressions = function () {
        var expressions = [];
        [this.nodes, this.sources, this.visits].each(
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
        for (var i = 0; i < this.visits.length; i++) {
            var visit = this.visits[i];
            visit.number.lock = visit.number.value ? true : false;
        }
    };

    this.addSource();
    this.addNode();
}


var app = angular.module(
        'qnmApp',
        ['ui.bootstrap'],
        function ($httpProvider) {
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
        }
);

app.directive('input', function(){
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelController) {
            ngModelController.$parsers.push(function (data) {
                return data;
            });
            ngModelController.$formatters.push(function(data) {
                if (number(data)) {
                    return parseFloat(data.toPrecision(5));
                } else {
                    return data;
                }
            });
        }
    }
});

app.controller('MainCtrl', function ($scope) {

    $scope.model  = new Model();

    $scope.alerts = [];

    $scope.clearAlerts = function() {
        $scope.alerts = [];
    };

    $scope.inconsistentAlert = function() {
        if ($scope.alerts.length === 0) {
            $scope.alerts.push({type: 'error', msg: "Error! Performance Model is not consistent"});
        }
    };

    $scope.change = function (fieldName, unit) {
        $scope.clearAlerts();

        $scope.model.init();
        var calculator  = $scope.model.makeCalculator(fieldName, unit);

        if (!calculator) {
            return;
        }

        for (var result = null; result || calculator.next();) {
            result = calculator.execute();
            if (calculator.error) {
                $scope.inconsistentAlert();
                return;
            }
        }
    };

});




