"use strict";

function QNMUnit(id, title, rate, pattern) {
    this.id = id;
    this.title = (title || title === '') ? title : id;
    this.rate = rate || 1;
    this.pattern = pattern || "\\d*[\\., \\,]?\\d*";


    Object.defineProperty(this, 'shortTitle', {
        get: function () {
            return this.title;
        }
    });


    this.equals = function (other) {
        if (!other) {
            return null;
        }
        return (other instanceof QNMUnit) &&
            other.id === this.id;
    };
}

function Quantity() {

    this.calculated = false;
    this.inconsistent = false;
    this.coflicted = false;
    this.unit;
    this._text;

    this.empty = function () {
        return empty(this.value);
    };

    Object.defineProperty(this, 'pattern', {
        get: function () {
            return this.unit.pattern;
        }
    });

    Object.defineProperty(this, 'state', {
        get: function () {
            if (!this.valid() || this.inconsistent || this._text === undefined) {
                return "invalid";
            }
            if (this.coflicted) {
                return "conflict";
            }
            if (this.calculated) {
                return "eval";
            }
            return "";
        }
    });

    Object.defineProperty(this, 'text', {
        get: function () {
            return (this._text || this._text === 0) ?
                this._text :
                (number(this.value) ? formatNumber(this.value / this.unit.rate, 5) : this.value);
        },
        set: function (value) {
            this.calculated = false;
            this._text = value;
            this.value = number(value) ? formatNumber(value * this.unit.rate, 10) : value;
        }
    });
    function equals(value1, value2) {
        return parseFloat(value1).toPrecision(10) === parseFloat(value2).toPrecision(10);
    }

    function formatNumber(value, prec) {
        return Math.round(value) === value ? Math.round(value) : parseFloat(parseFloat(value).toPrecision(prec).toString());
    }

    this.availableUnits = function () {
        var result = [];
        if (!this.units) {
            return result;
        }
        for (var i = 0; i < this.units.length; i++) {
            if (!this.units[i].equals(this.unit)) {
                result.push(this.units[i]);
            }
        }
        return result;
    };

    this.setValue = function (newValue) {
        this.calculated = true;
        if ((this._text || this._text === 0) && equals(this._text, newValue)) {
            this.value = this._text;
        } else {
            this.value = parseFloat(newValue).toPrecision(10);
        }
        this.coflicted = (this._text || this._text === 0) ? !equals(this._text, newValue) : false;
        this._text = null;
    };

    this.setUnit = function (newValue) {
        this.unit = newValue;
        this._text = null;
    };

    this.valid = function () {
        return !this.value || (number(this.value) && this.value >= 0);
    };

    this.setDTO = function (dto) {
        this._text = null;
        this.value = dto[0];
        this.setUnitByStr(dto[1]);
        this.calculated = false;
    };

    this.setUnitByStr = function (unit) {
        if (unit) {
            for (var i = 0; i < this.units.length; i++) {
                if (this.units[i].id === unit) {
                    this.unit = this.units[i];
                    return;
                }
            }
        }
    };
}

function Utilization(value) {
    this.units = [
        new QNMUnit('rate'),
        new QNMUnit('percent', '%', 0.01)
    ];
    this.unit = this.unit || this.units[1];
    this.value = value;
    this._text = value;
    this.valid = function () {
        return !this.value || (number(this.value) && this.value < 1 && this.value >= 0);
    };
}
Utilization.prototype = new Quantity();

function QNMTime(value) {
    this.value = value;
    this._text = value;
    this.units = [
        new QNMUnit('ms', 'ms', 0.001),
        new QNMUnit('sec'),
        new QNMUnit('min', 'min', 60),
        new QNMUnit('hr', 'hr', 3600)
    ];
    this.unit = this.unit || this.units[1];
}
QNMTime.prototype = new Quantity();

function QNMNumber(value) {
    this.value = value;
    this._text = value;
    this.units = [new QNMUnit('pcs', '')];
    this.unit = this.unit || this.units[0];
}
QNMNumber.prototype = new Quantity();

function QNMName(value) {
    this.value = value;
    this.valid = function () {
        return this.value !== '';
    };
    Object.defineProperty(this, 'text', {
        get: function () {
            return this.value;
        },
        set: function (value) {
            this.value = value;
        }
    });

    this.setDTO = function (dto) {
        this._text = null;
        this.value = dto[0];
        this.calculated = false;
    };

    /*    Object.defineProperty(this, 'pattern', {
     get: function () {
     return "[\s\S]*";
     }
     });*/

    Object.defineProperty(this, 'state', {
        get: function () {
            if (!this.valid()) {
                return "invalid";
            }
            return "";
        }
    });
}


function QNMNodeName(value) {
    this.value = value;
    this.units = [
        new QNMUnit('cpu', 'CPU'),
        new QNMUnit('disk', 'Disk'),
        new QNMUnit('hdd', 'HDD'),
        new QNMUnit('ssd', 'SSD')
    ];

    this.unit = new QNMUnit('▾');

    this.availableUnits = function () {
        return this.units;
    };

    this.setUnit = function (newValue) {
        this.text = newValue.title;
    };

}
QNMNodeName.prototype = new QNMName();

function Throughput(value) {
    this.value = value;
    this._text = value;
    this.units = [
        new QNMUnit('tps'),
        new QNMUnit('tpm', 'tpm', 1 / 60),
        new QNMUnit('tph', 'tph', 1 / 3600)
    ];
    this.unit = this.unit || this.units[0];
}
Throughput.prototype = new Quantity();

function QNMCenter() {

    this.lastEvalParam = null;

    this.getByName = function (name) {
        return this.all[name];
    };

    this.setValue = function (param) {
        var quantity = this.getByName(param.name);
        quantity.setValue(param.value);
        this.lastEvalParam = param;
    };

    this.getAll = function () {
        var result = [];
        for (var name in this.all) {
            if (this.all.hasOwnProperty(name)) {
                result.push(this.getByName(name));
            }
        }
        return result;
    };

    this.getSignificance = function () {
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

    this.equals = function (other) {
        if (!other) {
            return null;
        }
        return (other instanceof QNMCenter) &&
            other.id === this.id;
    };

    this.setDTO = function (dto) {
        for (var name in this.all) {
            if (this.all.hasOwnProperty(name)) {
                var q = this.getByName(name);
                q.setDTO(dto[name]);
            }
        }
    };

    this.createDTO = function () {
        var result = {
            id: this.id,
            name: this.name
        };
        for (var name in this.all) {
            if (this.all.hasOwnProperty(name)) {
                var q = this.getByName(name);
                result[name] = [
                    q.calculated ? null : q.value,
                    q.unit ? q.unit.id : null
                ];
            }
        }
        return this.doCreateDTO(result);
    };

    this.doCreateDTO = function (result) {
        return result;
    };

}

function QNMClass(id, name) {
    this.id = id;
    this.name = new QNMName(name || "Class " + id);
    this.isOpen = true;

    this.throughput = new Throughput();
    this.thinkTime = new QNMTime();
    this.userNumber = new QNMNumber();
    this.responseTime = new QNMTime();

    this.all = {
        'NAME': this.name,
        'M': this.userNumber,
        'Z': this.thinkTime,
        'X': this.throughput,
        'R': this.responseTime
    };

    this.expressions = [
        new Expression([
            ['R', 'X'],
            ['Z', 'X'],
            [-1, 'M']
        ], this)
    ];

    this.open = function () {
        this.isOpen = true;
        this.thinkTime.value = null;
        this.userNumber.value = null;
    };

    this.close = function () {
        this.isOpen = false;
    };

    this.equals = function (other) {
        if (!other) {
            return null;
        }
        return (other instanceof QNMClass) &&
            other.id === this.id;
    };
}
QNMClass.prototype = new QNMCenter();

function QNMNode(id, name) {
    this.id = id;
    this.name = new QNMNodeName(name || "Node " + id);
    this.nodeNumber = new QNMNumber(1);
    this.utilization = new Utilization();
    this.meanNumberTasks = new QNMNumber();
    this.totalMeanNumberTasks = new QNMNumber();

    this.all = {
        'NAME': this.name,
        'NN': this.nodeNumber,
        'U': this.utilization,
        'N': this.meanNumberTasks,
        'TN': this.totalMeanNumberTasks
    };
    this.expressions = [
        new Expression([
            [-1, 'TN'],
            ['N', 'NN']
        ], this),
        // N = (1 - U)/U => U + U * N = N
        new Expression([
            ['U'],
            [-1, 'N'],
            ['U', 'N']
        ], this)
    ];

    this.equals = function (other) {
        if (!other) {
            return null;
        }
        return (other instanceof QNMNode) &&
            other.id === this.id;
    };
}
QNMNode.prototype = new QNMCenter();

function QNMVisit(clazz, node) {
    this.id = clazz.id + "-" + node.id;
    this.clazz = clazz;
    this.node = node;
    this.number = new QNMNumber();
    this.totalNumber = new QNMNumber(1);
    this.serviceTime = new QNMTime();
    this.serviceTime.unit = this.serviceTime.units[0];
    this.serviceDemands = new QNMTime();
    this.serviceDemands.unit = this.serviceDemands.units[0];
    this.utilization = new Utilization();
    this.residenceTime = new QNMTime();
    this.throughput = new Throughput();

    this.details = false;

    this.all = {
        'S': this.serviceTime,
        'D': this.serviceDemands,
        'U': this.utilization,
        'RT': this.residenceTime,
        'XI': this.throughput,
        'V': this.number,
        'TV': this.totalNumber
    };

    this.expressions = [
        new Expression([
            ['V', new Parameter('X', this.clazz)],
            [-1, 'XI']
        ], this),
        new Expression([
            ['U'],
            [-1, 'XI', 'S']
        ], this),
        /*        new Expression([
         [-1, 'RT', 'XI'],
         ['N']
         ], this),*/
        new Expression([
            [-1, 'S', 'V'],
            ['D']
        ], this),
        new Expression([
            [-1, 'TV'],
            ['V', new Parameter('NN', this.node)]
        ], this),
        // RT = S/(1 - SUM(U)) ->  RT = S + SUM(U * RT)
        new Expression([
            [-1, 'RT'],
            ['S'],
            [new Parameter('U', this.node), 'RT']
        ], this)
    ];

    this.doCreateDTO = function (result) {
        result.clazz = this.clazz.id;
        result.node = this.node.id;
        return result;
    };

    this.equals = function (other) {
        if (!other) {
            return null;
        }
        return (other instanceof QNMVisit) &&
            other.id === this.id;
    };

    this.hasDetails = function () {
        return parseFloat(this.node.nodeNumber.value) > 1;
    };

    this.isDetails = function () {
        return this.hasDetails() && this.details;
    };

    this.showDetails = function () {
        this.details = true;
    };

    this.hideDetails = function () {
        this.details = false;
    };


}
QNMVisit.prototype = new QNMCenter();

function Parameter(name, center) {
    this.name = name;
    this.center = center;
    this.value = center ? center.getByName(name).value : null;

    this.isUndefined = function () {
        return empty(this.value);
    };

    this.equals = function (other) {
        return other &&
            other instanceof Parameter &&
            other.name === this.name &&
            other.center.equals(this.center);
    };

    this.sync = function () {
        if (empty(this.value) || (!this.center)) {
            return null;
        }
        this.center.setValue(this);
        return this;
    };

    this.createDTO = function () {
        return {
            name: this.name,
            value: this.value,
            centerId: this.center.id,
            centerType: this.center instanceof QNMClass ? "clazz" :
                (this.center instanceof QNMNode ? "node" : "visit")
        };
    };
}

function Calculator(fields, expressions) {
    this.fields = fields;
    this.parameters = [];
    this.expressions = expressions;
    this.error = false;

    this.next = function () {
        if (this.fields.length === 0) {
            return false;
        }
        var field = this.fields[0];
        this.fields.remove(field);
        return this.input(field);
    };

    this.execute = function () {
        for (var i = this.expressions.length - 1; i >= 0; i--) {
            var exp = this.expressions[i];
            var result = exp.solve(this.parameters);
            if (result) {
                this.expressions.remove(exp);
                this.error = !result.sync();
                if (!this.error) {
                    this.parameters.push(result);
                    for (var j = 0; j < this.fields.length; j++) {
                        if (this.fields[j].equals(result)) {
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

    this.input = function (param) {
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


    this.last = function () {
        return this.parameters[this.parameters.length - 1];
    };

    this.number = function () {
        return this.parameters.length;
    };

}

function Expression(expression, center) {

    this.expression = expression.clone();

    if (center) {
        this.expression.subst(
            function (v) {
                return (number(v) || v instanceof Parameter) ? v : new Parameter(v, center);
            }
        );
    }

    this.args = this.expression.unique().filterBy(
        function (v) {
            return !number(v);
        }
    );

    this.unknown = function (params) {
        var result = this.args.filterBy(
            function (v) {
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

    this.solve = function (params) {
        var x = this.unknown(params);
        if (!x) {
            return null;
        }
        var mult = 0;
        var term = 0;
        for (var i = 0; i < this.expression.length; i++) {
            var factor = calculateFactor(this.expression[i], params);
            if (this.expression[i].contains(x)) {
                mult = mult + factor;
            } else {
                term = term - factor;
            }
        }
        term = parseFloat(Math.round(term * 10000000000) / 10000000000);
        mult = parseFloat(Math.round(mult * 10000000000) / 10000000000);
        x.value = parseFloat(Math.round(term * 100000 / mult) / 100000);
        return x;
    };
}

function QNM(name, id) {
    this.id = id;
    this.name = name;
    this.type = "qnm";
    this.view = "views/qnm.html";
    this.classes = [];
    this.nodes = [];
    this.visits = [];

    var classNo = 0;
    var nodeNo = 0;
    var changedFields = [];

    this.createDTO = function () {
        var memento = new Memento();
        memento.id = this.id;
        memento.name = this.name;
        memento.type = "qnm";
        memento.classNo = classNo;
        memento.nodeNo = nodeNo;
        memento.changedFields = createArrayDTO(changedFields);
        memento.classes = createArrayDTO(this.classes);
        memento.nodes = createArrayDTO(this.nodes);
        memento.visits = createArrayDTO(this.visits);
        return memento;
    };

    this.setDTO = function (memento) {
        this.id = memento.id;
        this.name = memento.name;
        classNo = memento.classNo;
        nodeNo = memento.nodeNo;
        this.classes = [];
        for (var i1 = 0; i1 < memento.classes.length; i1++) {
            var clazz = new QNMClass(
                memento.classes[i1].id,
                memento.classes[i1].name
            );
            clazz.setDTO(memento.classes[i1]);
            this.classes.push(clazz);
        }
        this.nodes = [];
        for (var i2 = 0; i2 < memento.nodes.length; i2++) {
            var node = new QNMNode(
                memento.nodes[i2].id,
                memento.nodes[i2].name
            );
            node.setDTO(memento.nodes[i2]);
            this.nodes.push(node);
        }
        this.visits = [];
        for (var i3 = 0; i3 < memento.visits.length; i3++) {
            var node1 = this.getNodeById(memento.visits[i3].node);
            var class1 = this.getClassById(memento.visits[i3].clazz);
            var visit = new QNMVisit(class1, node1);
            visit.setDTO(memento.visits[i3]);
            this.visits.push(visit);
        }

        changedFields = [];
        for (var i5 = 0; i5 < memento.changedFields.length; i5++) {
            var field = memento.changedFields[i5];
            var center = this.getCenterBy(field);
            if (!center) {
                return false;
            }
            var parameter = new Parameter(field.name, center);
            parameter.value = field.value;
            changedFields.push(parameter);
        }
        return this.recalculate();
    };

    function getElementById(array, id) {
        for (var i = 0; i < array.length; i++) {
            if (id === array[i].id) {
                return array[i];
            }
        }
        return null;
    }

    this.getCenterBy = function (field) {
        switch (field.centerType) {
            case "clazz":
                return getElementById(this.classes, field.centerId);
            case "node":
                return getElementById(this.nodes, field.centerId);
            case "visit":
                return getElementById(this.visits, field.centerId);
            default:
                return null;
        }
    };

    this.addClass = function () {
        var clazz = new QNMClass(++classNo);
        this.classes.push(clazz);
        changedFields = changedFields.concat(clazz.getSignificance());
        for (var i = 0; i < this.nodes.length; i++) {
            var visit = new QNMVisit(clazz, this.nodes[i]);
            this.visits.push(visit);
            changedFields = changedFields.concat(visit.getSignificance());
        }
    };

    this.removeClass = function (clazz) {
        this.classes.remove(clazz);
        for (var i = 0; i < this.nodes.length; i++) {
            var visit = this.getVisitBy(clazz, this.nodes[i]);
            this.visits.remove(visit);
        }
    };

    this.addNode = function () {
        var node = new QNMNode(++nodeNo);
        this.nodes.push(node);
        for (var i = 0; i < this.classes.length; i++) {
            var visit = new QNMVisit(this.classes[i], node);
            this.visits.push(visit);
            changedFields = changedFields.concat(visit.getSignificance());
        }
        changedFields = changedFields.concat(node.getSignificance());
    };

    this.removeNode = function (node) {
        this.nodes.remove(node);
        for (var i = 0; i < this.classes.length; i++) {
            this.visits.remove(this.getVisitBy(this.classes[i], node));
        }
    };

    this.getVisitBy = function (clazz, node) {
        for (var i = 0; i < this.visits.length; i++) {
            if (this.visits[i].clazz === clazz && this.visits[i].node === node) {
                return this.visits[i];
            }
        }
        return null;
    };

    this.getClassById = function (id) {
        for (var i = 0; i < this.classes.length; i++) {
            if (this.classes[i].id === id) {
                return this.classes[i];
            }
        }
        return null;
    };

    this.getNodeById = function (id) {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].id === id) {
                return this.nodes[i];
            }
        }
        return null;
    };

    this.getVisitsByClass = function (clazz) {
        var result = [];
        for (var i = 0; i < this.visits.length; i++) {
            if (this.visits[i].clazz === clazz) {
                result.push(this.visits[i]);
            }
        }
        return result;
    };

    this.getVisitsByNode = function (node) {
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

        [this.classes, this.nodes, this.visits].each(
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

    this.valid = function () {
        var result = true;
        [this.classes, this.nodes, this.visits].each(
            function (u) {
                var fields = u.getAll();
                for (var i = 0; i < fields.length; i++) {
                    if (!fields[i].valid()) {
                        result = false;
                        break;
                    }
                }
            }
        );
        return result;
    };

    // R = SUM(RT * V)
    this.makeRXNExps = function (clazz) {
        var result = [
            [new Parameter('R', clazz)]
        ];
        var visits = this.getVisitsByClass(clazz);
        for (var j = 0; j < visits.length; j++) {
            result.push([-1, new Parameter('RT', visits[j]), new Parameter('V', visits[j])]);
        }
        return new Expression(result);
    };

    // U =  SUM(U)
    this.makeUExp = function (node) {
        var result = [[-1, new Parameter('U', node)]];
        var visits = this.getVisitsByNode(node);
        for (var j = 0; j < visits.length; j++) {
            result.push([new Parameter('U', visits[j])]);
        }
        return new Expression(result);
    };

    this.makeExpressions = function () {
        var result = [];
        for (var j = 0; j < this.nodes.length; j++) {
            result.push(this.makeUExp(this.nodes[j]));
        }
        for (var i = 0; i < this.classes.length; i++) {
            result.push(this.makeRXNExps(this.classes[i]));
        }
        return result;
    };

    this.getExpressions = function () {
        var expressions = this.makeExpressions();
        [this.classes, this.visits, this.nodes].each(
            function (u) {
                expressions = expressions.concat(u.expressions);
            }
        );
        return expressions;
    };

    this.init = function () {
        [this.classes, this.visits, this.nodes].each(
            function (u) {
                var all = u.getAll();
                for (var j = 0; j < all.length; j++) {
                    all[j].coflicted = false;
                    all[j].inconsistent = false;
                }
            }
        );
    };

    this.makeCalculator = function () {
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

    this.cleanCalcFields = function () {
        [this.classes, this.visits, this.nodes].each(
            function (u) {
                var all = u.getAll();
                for (var j = 0; j < all.length; j++) {
                    if (all[j].calculated) {
                        all[j].text = undefined;
                        all[j].calculated = false;
                    }
                }
            }
        );
    };

    this.recalculate = function () {
        var calculator = this.makeCalculator();
        if (!calculator) {
            return true;
        }
        for (var result = null; result || calculator.next();) {
            result = calculator.execute();
            if (calculator.error) {
                return false;
            }
        }
        return true;
    };

    this.applyChangedField = function (changedField) {
        if (changedFields.contains(changedField)) {
            changedFields.remove(changedField);
        }
        if (changedField.isUndefined()) {
            return false;
        }
        changedFields.push(changedField);
        return true;
    };

    this.calculate = function (changedField) {
        if (!this.applyChangedField(changedField)) {
            return true;
        }
        return this.recalculate();
    };

}
