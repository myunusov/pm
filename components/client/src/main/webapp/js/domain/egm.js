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
        if (value) {
            return;
        }
        for (var j = 0; j < resources.length; j++) {
            var key = resources[j].id;
            this.values[key] = value;
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

    this.types = {
        "R": {type: EGMRoutine, title: "Basic"},
        "L": {type: EGMLoop,    title: "Repetition"},
        "S": {type: EGMSwitch,  title: "Case"},
        "F": {type: EGMSplit,   title: "Split"},
        "P": {type: EGMPardo,   title: "Pardo"},
        "C": {type: EGMLink,    title: "Call"}
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
        result.steps = createArrayDTO(this.steps);
        return this.doCreateDTO(result);
    };

    this.doSetDTO = function () {
    };

    this.doCreateDTO = function (result) {
        return result;
    };

    this.findById = function(id) {
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

    this.moveAtFirst = function (step) {
        this.removeSelf();
        var parent = step;
        this.parent = parent;
        if (parent.isSwitch()) {
            this.rate = 0.5;
        }
        parent.steps.splice(0, 0, this);
        this.change();
    };

    this.moveAfter = function (step) {
        this.removeSelf();
        var parent = step.parent;
        this.parent = parent;
        if (parent.isSwitch()) {
            this.rate = 0.5;
        }
        parent.steps.splice(parent.steps.indexOf(step) + 1, 0, this);
        this.change();
    };

    this.removeStep = function (step) {
        this.steps.remove(step);
        this.change();
    };

    this.removeSelf = function () {
        this.parent.removeStep(this);
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
            this.resolve(this.id);
        } else {
            this.parent.change();
        }
    };

    this.resolve = function (newId) {
        this.id = newId || this.id;
        if (this.isLeaf()) {
            this.worst = this.avg;
            this.best = this.avg;
        } else {
            for (var i = 0; i < this.steps.length; i++) {
                var index = i + 1;
                var id = this.id + "." + index;
                this.steps[i].resolve(id);
            }
            this.best.clear();
            this.avg.clear();
            this.worst.clear();
            this.updateChildren();
        }
        this.onUpdate();
    };

    this.updateChildren = function () {
        for (var i = 0; i < this.steps.length; i++) {
            this.calc(this.steps[i]);
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

    this.getClass = function () {
        return (this.isParent() ? " parent-li" : "" + " last-child") + (this.inconsistent ? " invalid" : "");
    };

    this.theme = function () {
        return this.inconsistent ? " md-warn" : this.iscompleted ? "md-primary" : "md-accent";
    };

}

function EGMLink() {
    this.id;
    this.parent;
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

    this.resolve = function (newId) {
        this.id = newId || this.id;
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
        this.onUpdate();
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

function EGMScenario(id, model) {

    this.id = id;
    this.name = "Scenario";
    this.model = model;
    this.parent = null;

    this.avg = new SEMValues(this);
    this.best = new SEMValues(this);
    this.worst = new SEMValues(this);

    this.steps = [];
    this.links = [];

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

    this.getResources = function () {
        return this.model.resources;
    };

    this.removeSelf = function () {
        this.model.removeScenario(this);
        for (var i = 0; i < this.links.length; i++) {
            this.links[i].removeScenario();
        }
    };
}

EGMScenario.prototype = new EGMStep("C");

function EGMRoutine() {
    this.id;
    this.parent;
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
    this.id;
    this.parent;
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

}

EGMLoop.prototype = new EGMStep("L");

function EGMSwitch() {
    this.id;
    this.parent;
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
}

EGMSwitch.prototype = new EGMStep("S");

function EGMSplit() {
    this.id;
    this.parent;
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
        this.avg.min(step.avg);
        this.worst.min(step.worst);
    };

}

EGMSplit.prototype = new EGMStep("F");


function EGMPardo() {
    this.id;
    this.parent;
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
        memento.resources = createArrayDTO(this.resources);
        memento.scenarios = createArrayDTO(this.scenarios);
        return memento;
    };

    this.setDTO = function (memento) {
        this.id = memento.id;
        this.name = memento.name;

        resourcesNo = memento.resourcesNo;
        scenarioNo = memento.scenarioNo;

        this.resources = [];
        for (var i1 = 0; i1 < memento.resources.length; i1++) {
            var resource = new EGMResource(
                memento.resources[i1].id,
                memento.resources[i1].name
            );
            resource.setDTO(memento.resources[i1]);
            this.resources.push(resource);
        }

        this.scenarios = [];
        for (var i2 = 0; i2 < memento.scenarios.length; i2++) {
            var scenario = new EGMScenario(
                memento.scenarios[i2].id,
                this
            );
            scenario.setDTO(memento.scenarios[i2]);
            this.scenarios.push(scenario);
        }
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
        var scenario = new EGMScenario(++scenarioNo, this);
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

    this.findById = function(id) {
        for (var i = 0; i < this.scenarios.length; i++) {
            if ("" + this.scenarios[i].id === id) {
                return this.scenarios[i];
            }
            if (id.indexOf(this.scenarios[i].id) === 0) {
                return this.scenarios[i].findById(id);
            }
        }
        return null;
    }

}


