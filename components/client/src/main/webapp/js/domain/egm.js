"use strict";

function format(number) {
    return parseFloat(number.toPrecision(5)).toString();
}

function EGMResource(id, name) {
    this.id = id;
    this.name = name || "Resource " + id;

    this.setDTO = function (memento) {
        this.id = memento.id;
        this.name = memento.name;
    };

    this.createDTO = function () {
        return {
            id: this.id,
            name: this.name
        };
    };
}

function SEMValues(owner) {

    this.values = {};

    this.setDTO = function (memento) {
        this.values = memento;
    };

    this.createDTO = function () {
        return this.values;
    };

    this.clear = function () {
        this.values = {};
    };

    this.set = function (value) {
        var resources = owner.getResources();
        if (!value && value != 0) {
            return;
        }
        for (var j = 0; j < resources.length; j++) {
            var key = resources[j].id;
            this.values[key] = value;
        }
    };

    this.setAll = function (values) {
        var resources = owner.getResources();
        if (!values) {
            return;
        }
        for (var j = 0; j < resources.length; j++) {
            var key = resources[j].id;
            this.values[key] = values[key];
        }
    };

    this.add = function (values) {
        var resources = owner.getResources();
        for (var j = 0; j < resources.length; j++) {
            var key = resources[j].id;
            if (values.values[key] || values.values[key] === 0) {
                this.values[key] = parseFloat(parseFloat(values.values[key]) + parseFloat(this.values[key] || 0));
            }
        }
    };

    this.addWithMult = function (values, rate) {
        var resources = owner.getResources();
        var number = parseFloat(rate);
        for (var j = 0; j < resources.length; j++) {
            var key = resources[j].id;
            if (values.values[key] || values.values[key] === 0) {
                this.values[key] = parseFloat(parseFloat(values.values[key]) * number + parseFloat(this.values[key] || 0));
            }
        }
    };

    this.min = function (values) {
        var resources = owner.getResources();
        for (var j = 0; j < resources.length; j++) {
            var key = resources[j].id;
            if (values.values[key] || values.values[key] === 0) {
                var newValue = parseFloat(values.values[key]);
                if (!this.values[key]) {
                    this.values[key] = newValue;
                } else {
                    var oldValue = parseFloat(this.values[key] || 0);
                    this.values[key] = newValue < oldValue ? newValue : oldValue;
                }
            }
        }
    };

    this.avg = function (values) {
        var resources = owner.getResources();
        for (var j = 0; j < resources.length; j++) {
            var key = resources[j].id;
            if (values.values[key] || values.values[key] === 0) {
                var newValue = parseFloat(values.values[key]);
                if (!this.values[key]) {
                    this.values[key] = newValue;
                } else {
                    var oldValue = parseFloat(this.values[key] || 0);
                    this.values[key] = newValue < oldValue ? newValue : oldValue;
                }
            }
        }
    };

    this.max = function (values) {
        var resources = owner.getResources();
        for (var j = 0; j < resources.length; j++) {
            var key = resources[j].id;
            if (values.values[key] || values.values[key] === 0) {
                var newValue = parseFloat(values.values[key]);
                if (!this.values[key]) {
                    this.values[key] = newValue;
                } else {
                    var oldValue = parseFloat(this.values[key] || 0);
                    this.values[key] = newValue > oldValue ? newValue : oldValue;
                }
            }
        }
    };

}

function EGMStep(type) {
    this.url = "stepContent.html";
    this.inconsistent = false;
    this.iscompleted = true;
    this.type = type;
    this.rate = 1;
    this.repeat = 1;
    this.steps = [];
    this.contributions = {};

    this.types = {
        "R": {type: EGMRoutine, title: "Basic"},
        "L": {type: EGMLoop, title: "Repetition"},
        "S": {type: EGMSwitch, title: "Case"},
        "F": {type: EGMSplit, title: "Split"},
        "P": {type: EGMPardo, title: "Pardo"},
        "C": {type: EGMLink, title: "Call"}
    };

    this.setDTO = function (memento) {
        this.id = memento.id;
        this.name = memento.name;
        this.type = memento.type;

        this.avg = new SEMValues(this);
        this.avg.setDTO(memento.values);

        this.rate = memento.rate;
        this.repeat = memento.repeat;

        this.doSetDTO(memento);
        this.steps = [];

        for (var i = 0; i < memento.steps.length; i++) {
            var step = new (Function.prototype.bind.call(this.types[memento.steps[i].type].type));
            step.parent = this;
            step.setDTO(memento.steps[i]);
            this.steps.push(step);
        }
    };

    this.createDTO = function () {
        var result = {
            id: this.id,
            name: this.name,
            type: this.type,
            values: this.avg.createDTO(),
            rate: this.rate
        };
        result.steps = this.steps.createDTO();
        return this.doCreateDTO(result);
    };

    this.doSetDTO = function () {
    };

    this.doCreateDTO = function (result) {
        return result;
    };

    this.findById = function (id) {
        for (var i = 0; i < this.steps.length; i++) {
            if (this.steps[i].id === id) {
                return this.steps[i];
            }
            if (id.indexOf(this.steps[i].id) > -1) {
                return this.steps[i].findById(id);
            }
        }
        return null;
    };

    this.removeStep = function (step) {
        this.steps.remove(step);
        this.change();
    };

    this.removeSelf = function () {
        this.parent.removeStep(this);
    };

    this.isChild = function (step) {
        return this.id.indexOf(step.id) === 0;
    };

    this.dragOver = function (step) {
        return step instanceof EGMStep && !this.isChild(step);
    };

    this.dropBefore = function (step) {
        this.parent.insert(step, this.parent.steps.indexOf(this));
    };

    this.dropAfter = function (step) {
        this.parent.insert(step, this.parent.steps.indexOf(this) + 1);
    };

    this.dropIn = function (step) {
        this.insert(step, 0);
    };

    this.insert = function (step, pos) {
        step.removeSelf();
        step.parent = this;
        if (this.isSwitch()) {
            step.rate = 0.5;
        }
        this.steps.splice(pos, 0, step);
        this.change();
    };


    this.addStep = function (type) {
        var step = new (Function.prototype.bind.call(this.types[type].type));
        step.parent = this;
        if (this.isSwitch()) {
            step.rate = 0.5;
        }
        this.steps.push(step);
        this.change();
    };

    this.allScenarios = function () {
        return this.parent.allScenarios();
    };

    this.addScenario = function () {
        return this.parent.addScenario();
    };

    this.findScenario = function (id) {
        return this.parent.findScenario(id);
    };

    this.getResources = function () {
        return this.parent.getResources();
    };

    this.change = function () {
        if (this.isRoot()) {
            this.resolve();
        } else {
            this.parent.change();
        }
    };

    this.resolve = function (newId) {
        this.updateId();
        this.recalc();
        this.onUpdate();
    };

    this.updateId = function (newId) {
        this.id = newId || this.id;
        for (var i = 0; i < this.steps.length;) {
            this.steps[i].updateId(this.id + "." + ++i);
        }
    };

    this.recalc = function () {
        if (this.isLeaf()) {
            this.worst.setAll(this.avg.values);
            this.best.setAll(this.avg.values);
        } else {
            for (var i = 0; i < this.steps.length; i++) {
                this.steps[i].recalc();
                this.steps[i].calcContributions();
            }
            this.best.clear();
            this.avg.clear();
            this.worst.clear();
            this.updateChildren();
        }
        if (this.isScenario()) {
            this.calcContributions();
            var bottleNecks = {};
            var v = {};
            for (var stepId in this.contributions) {
                if (this.contributions.hasOwnProperty(stepId)) {
                    var c = this.contributions[stepId].values;
                    for (var resId in c) {
                        if (c.hasOwnProperty(resId)) {
                            if (!bottleNecks[resId] || parseFloat(c[resId]) > parseFloat(v[resId])) {
                                v[resId] = c[resId];
                                bottleNecks[resId] = stepId;
                            }
                        }
                    }
                }
            }
            this.bottleNecks = bottleNecks;
        }
    };

    this.updateChildren = function () {
        for (var i = 0; i < this.steps.length; i++) {
            this.calc(this.steps[i]);
            this.steps[i].onUpdate();
        }
    };

    this.onUpdate = function () {
        this.iscompleted = true;
        this.inconsistent = false;
    };

    this.calc = function (step) {
        this.best.add(step.best);
        this.avg.add(step.avg);
        this.worst.add(step.worst);
    };

    this.calcContributions = function () {
        if (this.isLeaf()) {
            this.contributions = {};
            this.contributions[this.id] = this.avg;
        } else {
            this.contributions = {};
            for (var i = 0; i < this.steps.length; i++) {
                var step = this.steps[i];
                for (var key in step.contributions) {
                    if (step.contributions.hasOwnProperty(key)) {
                        this.contributions[key] = step.contributions[key];
                    }
                }
            }
        }

    };

    this.isParent = function () {
        return this.steps.length > 0;
    };

    this.isRoot = function () {
        return !this.parent;
    };

    this.isNode = function () {
        return this.isParent() && !this.isRoot();
    };

    this.isLeaf = function () {
        return !this.isParent() && !this.isRoot() && this.type === "R";
    };

    this.isLoop = function () {
        return this.type === "L";
    };

    this.isSwitch = function () {
        return this.type === "S";
    };

    this.isSplit = function () {
        return this.type === "F";
    };

    this.isRoutine = function () {
        return this.type === "R";
    };

    this.isScenario = function () {
        return this.type === "C";
    };

    this.isCase = function () {
        return this.parent && this.parent.isSwitch();
    };

    this.theme = function () {
        return this.inconsistent ? " md-warn" : this.iscompleted ? "md-primary" : "md-accent";
    };

}

function EGMLink() {
    this.scenarioId = null;
    this.scenario = null;
    this._name = "";
    this.steps = [];

    Object.defineProperty(this, 'name', {
        get: function () {
            return this.scenario ? this.scenario.name : this._name;
        },
        set: function (value) {
            if (this.scenario) {
                this.scenario.name = value;
            } else {
                this._name = value;
            }
        }
    });

    this.iscompleted = false;

    this.types = [];

    this.choiseScenario = function (scenario) {
        this.setScenario(scenario);
        this.change();
    };

    this.addScenario = function () {
        this.setScenario(this.parent.addScenario());
        this.change();
    };

    this.removeScenario = function (scenario) {
        this.scenarioId = null;
        this.scenario = null;
        this.change();
    };

    this.setScenario = function (scenario) {
        this.scenario = scenario;
        this.scenarioId = scenario.id;
        scenario.addLink(this);
    };

    this.doCreateDTO = function (result) {
        result.scenarioId = this.scenario ? this.scenario.id : null;
        return result;
    };

    this.doSetDTO = function (memento) {
        this.scenarioId = memento.scenarioId;
    };

    this.recalc = function () {
        if (!this.scenarioId) {
            this.avg = new SEMValues(this);
            this.best = new SEMValues(this);
            this.worst = new SEMValues(this);
        } else {
            if (!this.scenario) {
                this.setScenario(this.findScenario(this.scenarioId));
            }
            this.avg = this.scenario.avg;
            this.best = this.scenario.best;
            this.worst = this.scenario.worst;
        }
    };

    this.calcContributions = function () {
        this.contributions = {};
        this.contributions[this.id] = new SEMValues(this);
        if (this.scenarioId) {
            this.contributions[this.id].add(this.avg);
        }
    };

    this.onUpdate = function () {
        this.iscompleted = this.scenario;
    };

    this.image = function () {
        return "latency.svg";
    };

    this.removeSelf = function () {
        this.parent.removeStep(this);
        if (this.scenario)
            this.scenario.removeLink(this);
    };
}

EGMLink.prototype = new EGMStep("C");

function EGMScenario(model, id) {
    this.id = id;
    this.name = "Scenario";
    this.model = model;
    this.parent = null;

    this.avg = new SEMValues(this);
    this.best = new SEMValues(this);
    this.worst = new SEMValues(this);

    this.steps = [];
    this.links = [];

    this.bottleNecks = {};

    this.onUpdate = function () {
        for (var i = 0; i < this.links.length; i++) {
            this.links[i].change();
        }
    };

    this.image = function () {
        return "latency.svg";
    };

    this.addLink = function (link) {
        this.links.push(link);
    };

    this.removeLink = function (link) {
        this.links.push(link);
        this.links.remove(link);
    };

    this.allSteps = function () {
        var result = [];
        findAll(result, this);
        return result;
    };

    function findAll(result, parent) {
        result.push(parent);
        parent.steps.each(
            function (step) {
                findAll(result, step);
            }
        );
    }

    this.addScenario = function () {
        return this.model.addScenario();
    };

    this.findScenario = function (id) {
        return this.model.findScenario(id);
    };

    this.allScenarios = function () {
        var result = this.model.scenarios.clone();
        result.remove(this);
        return result;
    };


    this.getResources = function () {
        return this.model.resources;
    };

    this.removeSelf = function () {
        this.model.removeScenario(this);
        for (var i = 0; i < this.links.length; i++) {
            this.links[i].removeScenario();
        }
    };

    this.clazz = function(resourceId, stepId) {
        if (this.bottleNecks[resourceId] == stepId) {
            return "bottleneck"
        }
    }
}
EGMScenario.prototype = new EGMStep("C");

function EGMRoutine() {
    this.name = "Step";

    this.rate = 1;
    this.avg = new SEMValues(this);
    this.best = new SEMValues(this);
    this.worst = new SEMValues(this);
    this.steps = [];

    this.image = function () {
        return this.isNode() ? "expanded.svg" : "basic.svg";
    };
}

EGMRoutine.prototype = new EGMStep("R");

function EGMLoop() {
    this.name = "Loop";

    this.repeat = 2;
    this.avg = new SEMValues(this);
    this.best = new SEMValues(this);
    this.worst = new SEMValues(this);
    this.steps = [];
    this.iscompleted = false;

    this.doCreateDTO = function (result) {
        result.repeat = this.repeat;
        return result;
    };

    this.doSetDTO = function (memento) {
        this.repeat = memento.repeat;

    };

    this.onUpdate = function () {
        this.iscompleted = this.steps.length > 0;
    };

    this.image = function () {
        return "repetition.svg";
    };

    this.calc = function (step) {
        this.best.addWithMult(step.best, this.repeat);
        this.avg.addWithMult(step.avg, this.repeat);
        this.worst.addWithMult(step.worst, this.repeat);
    };

    this.calcContributions = function () {
        this.contributions = {};
        for (var i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            for (var key in step.contributions) {
                if (step.contributions.hasOwnProperty(key)) {
                    var contribution = step.contributions[key];
                    this.contributions[key] = new SEMValues(this);
                    if (contribution) {
                        this.contributions[key].addWithMult(contribution, this.repeat);
                    }
                }
            }
        }
    };

}

EGMLoop.prototype = new EGMStep("L");

function EGMSwitch() {
    this.name = "Switch";

    this.rate = 1;
    this.avg = new SEMValues(this);
    this.best = new SEMValues(this);
    this.worst = new SEMValues(this);
    this.steps = [];
    this.iscompleted = false;

    this.onUpdate = function () {
        this.iscompleted = this.steps.length > 0;
        this.inconsistent = this.totalProbability() > 1;
    };

    this.image = function () {
        return "case.svg";
    };

    this.totalProbability = function () {
        var result = 0;
        this.steps.each(
            function (step) {
                result += parseFloat(step.rate);
            }
        );
        return result;
    };

    this.calc = function (step) {
        if (this.totalProbability() < 1) {
            this.best.set(0);
        } else {
            this.best.min(step.best);
        }
        this.avg.addWithMult(step.best, step.rate);
        this.worst.max(step.worst);
    };

    this.calcContributions = function () {
        this.contributions = {};
        for (var i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            for (var key in step.contributions) {
                if (step.contributions.hasOwnProperty(key)) {
                    var contribution = step.contributions[key];
                    this.contributions[key] = new SEMValues(this);
                    if (contribution) {
                        this.contributions[key].addWithMult(step.contributions[key], step.rate);
                    }
                }
            }
        }
    };
}

EGMSwitch.prototype = new EGMStep("S");

function EGMSplit() {
    this.name = "Split";

    this.rate = 1;
    this.avg = new SEMValues(this);
    this.best = new SEMValues(this);
    this.worst = new SEMValues(this);
    this.steps = [];
    this.iscompleted = false;

    this.onUpdate = function () {
        this.iscompleted = this.steps.length > 1;
    };

    this.image = function () {
        return "split.svg";
    };

    this.calc = function (step) {
        this.best.min(step.best);
        this.avg.avg(step.avg);
        this.worst.max(step.worst);
    };

    this.calcContributions = function () {
        this.contributions = {};
        for (var i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            for (var key in step.contributions) {
                if (step.contributions.hasOwnProperty(key)) {
                    var contribution = step.contributions[key];
                    this.contributions[key] = new SEMValues(this);
                    if (contribution) {
                        this.contributions[key] = step.contributions[key];
                    }
                }
            }
        }
    };

}

EGMSplit.prototype = new EGMStep("F");


function EGMPardo() {
    this.name = "Pardo";

    this.rate = 1;
    this.avg = new SEMValues(this);
    this.best = new SEMValues(this);
    this.worst = new SEMValues(this);
    this.steps = [];
    this.iscompleted = false;

    this.onUpdate = function () {
        this.iscompleted = this.steps.length > 1;
    };

    this.image = function () {
        return "pardo.svg";
    };

    this.calc = function (step) {
        this.best.max(step.best);
        this.avg.max(step.avg);
        this.worst.max(step.worst);
    };

    this.calcContributions = function () {
        this.contributions = {};
        for (var i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            for (var key in step.contributions) {
                if (step.contributions.hasOwnProperty(key)) {
                    var contribution = step.contributions[key];
                    this.contributions[key] = new SEMValues(this);
                    if (contribution) {
                        this.contributions[key] = step.contributions[key];
                    }
                }
            }
        }
    };
}
EGMPardo.prototype = new EGMStep("P");

function EGM(name, id) {
    this.id = id;
    this.name = name;
    this.type = "egm";
    this.view = "views/egm.html";

    this.resources = [];
    this.scenarios = [];

    var resourcesNo = 0;
    var scenarioNo = 0;

    this.createDTO = function () {
        var memento = new Memento();
        memento.id = this.id;
        memento.name = this.name;
        memento.type = "egm";
        memento.resourcesNo = resourcesNo;
        memento.scenarioNo = scenarioNo;
        memento.resources = this.resources.createDTO();
        memento.scenarios = this.scenarios.createDTO();
        return memento;
    };

    this.setDTO = function (memento) {
        this.id = memento.id;
        this.name = memento.name;

        resourcesNo = memento.resourcesNo;
        scenarioNo = memento.scenarioNo;

        this.resources = [];
        this.resources.setDTO(
            memento.resources,
            function() {
                return new EGMResource();
            }
        );

        var model = this;
        this.scenarios = [];
        this.scenarios.setDTO(
            memento.scenarios,
            function() {
                return new EGMScenario(model);
            }
        );

        this.init();
    };

    this.init = function () {
        for (var i = 0; i < this.scenarios.length; i++) {
            this.scenarios[i].resolve();
        }
    };

    this.addResource = function () {
        var resource = new EGMResource(++resourcesNo);
        this.resources.push(resource);
    };

    this.removeResource = function (resource) {
        this.resources.remove(resource);
    };


    this.addScenario = function () {
        var scenario = new EGMScenario(this, ++scenarioNo);
        this.scenarios.push(scenario);
        return scenario;
    };

    this.findScenario = function (id) {
        for (var i = 0; i < this.scenarios.length; i++) {
            if (this.scenarios[i].id === id) {
                return this.scenarios[i];
            }
        }
        return null;
    };

    this.removeScenario = function (scenario) {
        this.scenarios.remove(scenario);
    };

    this.findById = function (id) {
        for (var i = 0; i < this.scenarios.length; i++) {
            if ("" + this.scenarios[i].id === id) {
                return this.scenarios[i];
            }
            if (id.indexOf(this.scenarios[i].id) === 0) {
                return this.scenarios[i].findById(id);
            }
        }
        return null;
    };


}


