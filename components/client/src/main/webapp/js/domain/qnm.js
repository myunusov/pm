"use strict";

function QNMNodeName(value) {
    this.units = [
        new MXUnit('cpu', 'CPU'),
        new MXUnit('disk', 'Disk'),
        new MXUnit('hdd', 'HDD'),
        new MXUnit('ssd', 'SSD')
    ];

    this.value = value;
    this.unit = new MXUnit('▾');

    this.availableUnits = function () {
        return this.units;
    };

    this.setUnit = function (newValue) {
        this.value = newValue.title;
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

function QNMCenter() {

    this.owner = null;

    this.setDTO = function (dto) {
        this.id = dto.id;
        for (var name in this.all) {
            if (this.all.hasOwnProperty(name)) {
                var q = this.propertyById(name);
                q.setDTO(dto[name]);
            }
        }
    };

    this.createDTO = function () {
        var result = {
            id: this.id
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

    this.setParameter = function (key, value) {
        this.all[key] = value;
        value.owner = this;
    };

    this.parameter = function (key, property) {
        return new Parameter(key, this, property || this.all[key])
    };

    this.propertyById = function (name) {
        return this.all[name];
    };

    this.setValue = function (param) {
        var quantity = this.propertyById(param.name);
        quantity.setValue(param.value);
    };

    this.onchange = function (property) {
        var name = this.getNameFor(property);
        if (name) {
            this.owner.onchange(this.parameter(name, property));
        }
    };

    this.getNameFor = function (property) {
        for (var name in this.all) {
            if (this.all.hasOwnProperty(name)) {
                if (this.propertyById(name) === property) {
                    return name;
                }
            }
        }
        return null;
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
                var property = this.propertyById(name);
                if (number(property.value) && !property.isCalculated()) {
                    result.push(this.parameter(name));
                }
            }
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

function QNMClass(owner, id, modelKind) {
    this.id = id;
    this.owner = owner;
    this.all = {};

    this.setParameter('NAME', new MXName("Class " + id));
    this.setParameter('M', new MXNumber()); // userNumber
    this.setParameter('Z', new MXDuration('sec')); // thinkTime
    this.setParameter('X', new MXThroughput('tps')); // throughput
    this.setParameter('R', new MXDuration('sec')); // responseTime
    this.setParameter('RT', new MXDuration('sec')); // residenceTime

    this.title = function () {
        return this.all['NAME'].text;
    };

    this.throughput = function () {
        return this.all['X'];
    };

    this.responseTime = function () {
        return this.all['R'];
    };

    this.expressions = function () {
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

function QNMNode(owner, id) {
    this.id = id;
    this.owner = owner;
    this.all = {};

    this.setParameter('NAME', new QNMNodeName("Node " + id));
    this.setParameter('NN', new MXNumber(1)); // nodeNumber
    this.setParameter('U', new MXPercentage('percent')); // utilization
    this.setParameter('N', new MXNumber()); // meanNumberTasks
    this.setParameter('TN', new MXNumber()); // totalMeanNumberTasks

    this.expressions = function () {
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

function QNMVisit(owner, clazz, node) {
    this.id = clazz.id + "-" + node.id;
    this.owner = owner;
    this.all = {};
    this.clazz = clazz;
    this.node = node;
    this.details = false;

    this.setParameter('S', new MXDuration('ms')); // service Time
    this.setParameter('D', new MXDuration('ms')); // service Demands
    this.setParameter('U', new MXPercentage('percent')); // utilization
    this.setParameter('RT', new MXDuration('sec')); // residence Time
    this.setParameter('XI', new MXThroughput()); // throughput
    this.setParameter('V', new MXNumber()); // visits number
    this.setParameter('TV', new MXNumber(1)); // total visits number
    this.setParameter('TD', new MXDuration('ms')); // total service Demands
    this.setParameter('NI', new MXNumber()); //  mean Number Tasks

    this.expressions = function () {
        return [
            new Expression([
                ['V', this.clazz.parameter('X')],
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
                ['V', this.node.parameter('NN')]
            ], this),
            new Expression([
                [-1, 'TD'],
                ['D', this.node.parameter('NN')]
            ], this),
            // RT = S/(1 - SUM(U)) ->  RT = S + SUM(U * RT)
            new Expression([
                [-1, 'RT'],
                ['S'],
                [this.node.parameter('U'), 'RT']
            ], this)
        ];
    };

    this.title = function () {
        return this.node.title() + "/" + this.clazz.title();
    };

    this.doCreateDTO = function (result) {
        result.clazz = this.clazz.id;
        result.node = this.node.id;
        return result;
    };

    this.totalServiceDemands = function () {
        return parseFloat(this.all['D'].value);
    };

    this.hideDetails = function () {
        this.details = false;
    };

    this.showDetails = function () {
        this.details = true;
    };

    this.isDetails = function () {
        return this.node.hasDetails() && this.details;
    };


    this.hasDetails = function () {
        return this.node.hasDetails();
    };

    this.equals = function (other) {
        if (!other) {
            return null;
        }
        return (other instanceof QNMVisit) &&
            other.id === this.id;
    };


}
QNMVisit.prototype = new QNMCenter();

function Parameter(name, center, property) {
    this.name = name;
    this.center = center;
    this.value = center ? center.propertyById(name).value : null;

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
    };

    this.setToModel = function () {
        if (empty(this.value) || (!this.center)) {
            return null;
        }
        if (!property) {
            property = center.propertyById(this.name);
        }
        property.setValue(this.value);
        return this;
    };

    this.isUndefined = function () {
        return !number(this.value);
    };

    this.equals = function (other) {
        return other &&
            other instanceof Parameter &&
            other.name === this.name &&
            other.center.equals(this.center);
    };

}

function Calculator(fields, expressions) {

    var parameters = [];

    this.calculate = function () {
        while (this.next()) { // are there new manual params
            while (this.execute()) { // are there new calculated params
            }
        }
    };

    this.next = function () {
        if (fields.length === 0) {
            return false;
        }
        return take(fields[0]);
    };

    this.execute = function () {
        for (var i = expressions.length - 1; i >= 0; i--) {
            var result = expressions[i].solve(parameters);
            if (result) {
                expressions.remove(expressions[i]);
                if (!result.setToModel()) {
                    throw "Performance Model is not consistent";
                }
                return take(result);
            }
        }
        return null;
    };

    // from fields to params
    function take(param) {
        fields.remove(param);
        if (parameters.contains(param) || param.isUndefined()) {
            return null;
        }
        parameters.push(param);
        return param;
    }

}

function Expression(expression, center) {

    this.expression = expression.clone();

    if (center) {
        this.expression.subst(
            function (v) {
                return (number(v) || v instanceof Parameter) ? v : center.parameter(v);
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
        memento.visits = this.visits.createDTO();
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
            function (dto) {
                return new QNMClass(model, dto.id, model.kind);
            }
        );

        this.nodes = [];
        this.nodes.setDTO(
            memento.nodes,
            function (dto) {
                return new QNMNode(model, dto.id);
            }
        );

        this.visits = [];
        this.visits.setDTO(
            memento.visits,
            function (dto) {
                var node1 = model.getNodeById(dto.node);
                var class1 = model.getClassById(dto.clazz);
                return new QNMVisit(model, class1, node1);
            }
        );

        changedFields = [];
        changedFields.setDTO(
            memento.changedFields,
            function (dto) {
                return model.getCenterBy(dto).parameter(dto.name);
            }
        );

        return this.calculate();
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
        var clazz = new QNMClass(this, ++classNo, this.kind);
        this.classes.push(clazz);
        changedFields = changedFields.concat(clazz.getSignificance());
        for (var i = 0; i < this.nodes.length; i++) {
            var visit = new QNMVisit(this, clazz, this.nodes[i]);
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
        var node = new QNMNode(this, ++nodeNo);
        this.nodes.push(node);
        for (var i = 0; i < this.classes.length; i++) {
            var visit = new QNMVisit(this, this.classes[i], node);
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

    this.validate = function () {
        [this.classes, this.nodes, this.visits].each(
            function (u) {
                var fields = u.getAll();
                for (var i = 0; i < fields.length; i++) {
                    if (!fields[i].isValid()) {
                        throw "Performance Model is invalid. See " + u.title();
                    }
                }
            }
        );
        this.classes.each(
            function (u) {
                if (u.all['RT'].value > u.all['R'].value) {
                    throw "Performance Model is invalid. " + u.title() + ": R < RT";
                }
            }
        );
    };

    // R = SUM(RT * V)
    this.makeRXNExps = function (clazz) {
        var result = [
            [clazz.parameter('RT')]
        ];
        var visits = this.getVisitsByClass(clazz);
        for (var j = 0; j < visits.length; j++) {
            result.push([-1, visits[j].parameter('RT'), visits[j].parameter('V')]);
        }
        return new Expression(result);
    };

    // U =  SUM(U)
    this.makeUExp = function (node) {
        var result = [[-1, node.parameter('U')]];
        var visits = this.getVisitsByNode(node);
        for (var j = 0; j < visits.length; j++) {
            result.push([visits[j].parameter('U')]);
        }
        return new Expression(result);
    };

    // N =  SUM(N)
    this.makeNExp = function (node) {
        var result = [[-1, node.parameter('TN')]];
        var visits = this.getVisitsByNode(node);
        for (var j = 0; j < visits.length; j++) {
            result.push([visits[j].parameter('NI')]);
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

    this.onchange = function (changedField) {
        if (changedFields.contains(changedField)) {
            changedFields.remove(changedField);
        }
        if (!changedField.isUndefined()) {
            changedFields.push(changedField);
        }
    };

    this.calculate = function () {
        var calculator = this.makeCalculator();
        if (!calculator) {
            return;
        }
        calculator.calculate();

        this.validate();
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
                    all[j].cleanValue();
                }
            }
        );
    };


    this.setKind = function (kind) {
        this.cleanCalcFields();
        this.kind.setUnit(kind);
        return this.calculate();
    };


}
