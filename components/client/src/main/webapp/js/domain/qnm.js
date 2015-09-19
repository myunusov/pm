"use strict";

function QNMNodeName(value) {
    this.units = [
        new MXUnit('cpu', 'CPU'),
        new MXUnit('disk', 'Disk'),
        new MXUnit('hdd', 'HDD'),
        new MXUnit('ssd', 'SSD')
    ];

    this.text = value;
    this.unit = new MXUnit('▾');

    this.availableUnits = function () {
        return this.units;
    };

    this.setUnit = function (newValue) {
        this.text = newValue.title;
    };

}
QNMNodeName.prototype = new MXName();

function QNMModelKind() {
    this.units = [
        new MXUnit('open', 'Open Queuing Networks'),
        new MXUnit('closed', 'Closed Queuing Networks')
    ];
    this.unit = this.unit || this.units[0];

    this.createDTO = function () {
        return this.unit.id;
    };

    this.setDTO = function (dto) {
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].id === dto) {
                this.unit = this.units[i]
            }
        }
    };

    this.availableUnits = function () {
        var result = [];
        for (var i = 0; i < this.units.length; i++) {
            if (!this.units[i].equals(this.unit)) {
                result.push(this.units[i]);
            }
        }
        return result;
    };

    this.isOpen = function () {
        return this.unit.id === 'open';
    };


    this.setUnit = function (newValue) {
        this.unit = newValue;
    };
}

function Throughput(unitId, value) {
    this.units = [
        new MXUnit('tps'),
        new MXUnit('tpm', 'tpm', 1 / 60),
        new MXUnit('tph', 'tph', 1 / 3600)
    ];
    this.init(unitId, value)
}
Throughput.prototype = new MXQuantity();

function QNMCenter() {

    this.lastEvalParam = null;

    this.setDTO = function (dto) {
        this.id = dto.id;
        this.name = dto.name;
        for (var name in this.all) {
            if (this.all.hasOwnProperty(name)) {
                var q = this.propertyById(name);
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
                var q = this.propertyById(name);
                result[name] = q.createDTO();
            }
        }
        return this.doCreateDTO(result);
    };

    this.doCreateDTO = function (result) {
        return result;
    };

    this.propertyById = function (name) {
        return this.all[name];
    };

    this.setValue = function (param) {
        var quantity = this.propertyById(param.name);
        quantity.setValue(param.value);
        this.lastEvalParam = param;
    };

    this.getAll = function () {
        var result = [];
        for (var name in this.all) {
            if (this.all.hasOwnProperty(name)) {
                result.push(this.propertyById(name));
            }
        }
        return result;
    };

    this.getSignificance = function () {
        var result = [];
        for (var name in this.all) {
            if (this.all.hasOwnProperty(name)) {
                var value = this.propertyById(name).value;
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

}

function QNMClass(id, modelKind, name) {
    this.id = id;

    this.all = {
        'NAME': new MXName(name || "Class " + id),
        'M': new MXNumber(),       // userNumber
        'Z': new MXDuration('sec'),    // thinkTime
        'X': new Throughput('tps'), // throughput
        'R': new MXDuration('sec'),    // responseTime
        'RT': new MXDuration('sec')    // residenceTime
    };

    this.title = function () {
        return this.all['NAME'].text;
    };

    this.throughput = function() {
        return this.all['X'];
    };

    this.responseTime = function() {
        return this.all['R'];
    };

    this.expressions = function(){
        return modelKind.isOpen() ?
            [
                new Expression([
                    ['Z', 'X'],
                    [-1, 'M']
                ], this),
                new Expression([
                    ['RT'],
                    [-1, 'R']
                ], this)
            ] : [
            new Expression([
                ['R', 'X'],
                ['Z', 'X'],
                [-1, 'M']
            ], this)
        ];
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

    this.all = {
        'NAME': new QNMNodeName(name || "Node " + id),
        'NN': new MXNumber(1), // nodeNumber
        'U': new MXPercentage('percent'), // utilization
        'N': new MXNumber(),   // meanNumberTasks
        'TN': new MXNumber()   // totalMeanNumberTasks
    };

    this.expressions = function() {
        return [
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
    };

    this.title = function () {
        return this.all['NAME'].text;
    };

    this.nodeNumber = function () {
        return parseFloat(this.all['NN'].value);
    };

    this.hasDetails = function () {
        return this.nodeNumber() > 1;
    };

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

    this.details = false;

    this.all = {
        'S': new MXDuration('ms'),     // service Time
        'D': new MXDuration('ms'),     // service Demands
        'U': new MXPercentage('percent'),     // utilization
        'RT': new MXDuration(),        // residence Time
        'XI': new Throughput(),     // throughput
        'V': new MXNumber(),       // visits number
        'TV': new MXNumber(1),     // total visits number
        'TD': new MXDuration('ms'),    // total service Demands
        'NI': new MXNumber()       // mean Number Tasks
    };

    this.expressions = function() {
        return [
            new Expression([
                ['V', new Parameter('X', this.clazz)],
                [-1, 'XI']
            ], this),
            new Expression([
                ['U'],
                [-1, 'XI', 'S']
            ], this),
            new Expression([
                [-1, 'RT', 'XI'],
                ['NI']
            ], this),
            new Expression([
                [-1, 'S', 'V'],
                ['D']
            ], this),
            new Expression([
                [-1, 'TV'],
                ['V', new Parameter('NN', this.node)]
            ], this),
            new Expression([
                [-1, 'TD'],
                ['D', new Parameter('NN', this.node)]
            ], this),
            // RT = S/(1 - SUM(U)) ->  RT = S + SUM(U * RT)
            new Expression([
                [-1, 'RT'],
                ['S'],
                [new Parameter('U', this.node), 'RT']
            ], this)
        ];
    };

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

    this.isDetails = function () {
        return this.node.hasDetails() && this.details;
    };

    this.hasDetails = function () {
        return this.node.hasDetails();
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
    this.value = center ? center.propertyById(name).value : null;

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

    this.setDTO = function (dto) {
        this.value = dto.value;
        this.name = dto.name;
    }
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
    this.kind = new QNMModelKind();
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
        memento.kind = this.kind.createDTO();
        memento.classNo = classNo;
        memento.nodeNo = nodeNo;
        memento.changedFields = changedFields.createDTO();
        memento.classes = this.classes.createDTO();
        memento.nodes = this.nodes.createDTO();
        memento.visits =this.visits.createDTO();
        return memento;
    };

    this.setDTO = function (memento) {
        var model = this;

        this.id = memento.id;
        this.name = memento.name;
        this.kind.setDTO(memento.kind);
        classNo = memento.classNo;
        nodeNo = memento.nodeNo;
        this.classes = [];
        this.classes.setDTO(
            memento.classes,
            function(dto) {
                return new QNMClass(dto.id, model.kind, dto.name);
            }
        );

        this.nodes = [];
        this.nodes.setDTO(
            memento.nodes,
            function(dto) {
                return new QNMNode(dto.id, dto.name);
            }
        );

        this.visits = [];
        this.visits.setDTO(
            memento.visits,
            function(dto) {
                var node1 = model.getNodeById(dto.node);
                var class1 = model.getClassById(dto.clazz);
                return new QNMVisit(class1, node1);
            }
        );

        changedFields = [];
        changedFields.setDTO(
            memento.changedFields,
            function(dto) {
                var center = model.getCenterBy(dto);
                return new Parameter(dto.name, center);
            }
        );

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
        var clazz = new QNMClass(++classNo, this.kind);
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
                    if (!fields[i].isValid()) {
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
            [new Parameter('RT', clazz)]
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

    // N =  SUM(N)
    this.makeNExp = function (node) {
        var result = [[-1, new Parameter('TN', node)]];
        var visits = this.getVisitsByNode(node);
        for (var j = 0; j < visits.length; j++) {
            result.push([new Parameter('NI', visits[j])]);
        }
        return new Expression(result);
    };

    this.makeExpressions = function () {
        var result = [];
        for (var i1 = 0; i1 < this.nodes.length; i1++) {
            result.push(this.makeNExp(this.nodes[i1]));
        }
        for (var i2 = 0; i2 < this.nodes.length; i2++) {
            result.push(this.makeUExp(this.nodes[i2]));
        }
        for (var i3 = 0; i3 < this.classes.length; i3++) {
            result.push(this.makeRXNExps(this.classes[i3]));
        }
        return result;
    };

    this.expressions = function () {
        var expressions = this.makeExpressions();
        [this.classes, this.visits, this.nodes].each(
            function (u) {
                expressions = expressions.concat(u.expressions());
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
                }
            }
        );
    };

    this.makeCalculator = function () {
        var fields = this.getFieldsSeqBy(changedFields);
        if (!fields) {
            return null;
        }
        var expressions = this.expressions();
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

    this.setKind = function(kind) {
        this.kind.setUnit(kind);
        return this.recalculate();
    };


}
