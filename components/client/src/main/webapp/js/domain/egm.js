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

function EGMStep(type) {
    this.url = "stepContent.html";
    this.inconsistent = false;
    this.iscompleted = true;
    this.type = type;
    this.rate = 1;
    this.repeat = 1;
    this.values = {};
    this.best = {};
    this.worst = {};
    this.steps = [];
    this.stepNo = 0;

    this.onUpdate = function () {
        this.iscompleted = true;
        this.inconsistent = false;
    };

    this.setDTO = function (memento) {
        this.id = memento.id;
        this.name = memento.name;
        this.type = memento.type;
        this.stepNo = memento.stepNo;
        this.values = memento.values;
        this.rate = memento.rate;
        this.repeat = memento.repeat;
        this.doSetDTO(memento);
        this.steps = [];
        for (var i = 0; i < memento.steps.length; i++) {
            var step;
            if (memento.steps[i].type === "R") {
                step = new EGMRoutine(
                        memento.steps[i].id,
                        this
                );
            } else if (memento.steps[i].type === "L") {
                step = new EGMLoop(
                        memento.steps[i].id,
                        this
                );
            } else if (memento.steps[i].type === "F") {
                step = new EGMSplit(
                        memento.steps[i].id,
                        this
                );
            } else if (memento.steps[i].type === "S") {
                step = new EGMSwitch(
                        memento.steps[i].id,
                        this
                );
            } else if (memento.steps[i].type === "P") {
                step = new EGMPardo(
                        memento.steps[i].id,
                        this
                );
            } else if (memento.steps[i].type === "C") {
                step = new EGMLink(
                        memento.steps[i].id,
                        this
                );
            }
            step.setDTO(memento.steps[i]);
            this.steps.push(step);
        }
    };

    this.createDTO = function () {
        var result = {
            id: this.id,
            name: this.name,
            type: this.type,
            stepNo: this.stepNo,
            values: this.values,
            rate: this.rate
        };
        result.steps = createArrayDTO(this.steps);
        return this.doCreateDTO(result);
    };

    this.doSetDTO = function (memento) {
    };

    this.doCreateDTO = function (result) {
        return result;
    };

    this.availableChildren = [
        {id: "R", title: "Routine"},
        {id: "L", title: "Loop"},
        {id: "S", title: "Switch"},
        {id: "F", title: "Split"},
        {id: "P", title: "Pardo"},
        {id: "C", title: "Scenario"}
    ];

    this.addStep = function (type) {
        var id2 = this.id + "." + ++this.stepNo;
        var step;
        switch (type) {
            case "R":
                step = new EGMRoutine(id2, this);
                break;
            case "L":
                step = new EGMLoop(id2, this);
                break;
            case "S":
                step = new EGMSwitch(id2, this);
                break;
            case "F":
                step = new EGMSplit(id2, this);
                break;
            case "P":
                step = new EGMPardo(id2, this);
                break;
            case "C":
                step = new EGMLink(id2, this);
                step.setScenario(this.addScenario());
                break;
            default:
                step = new EGMRoutine(id2, this);
        }
        this.steps.push(step);
        this.onUpdate();
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
        this.worst = this.values;
        this.best = this.values;
        if (this.parent) {
            this.parent.resolve();
        }
        this.onUpdate();
    };

    this.resolve = function () {
        this.updateChildren();
        if (this.parent) {
            this.parent.resolve();
        }
        this.onUpdate();
    };

    this.init = function () {
        var hasChildren = this.steps.length > 0;
        if (hasChildren) {
            for (var i = 0; i < this.steps.length; i++) {
                this.steps[i].init();
            }
            this.updateChildren();
        } else {
            this.worst = this.values;
            this.best = this.values;
        }
        this.onUpdate();
    };

    this.updateChildren = function () {
        var calc = this.makeCalculator();
        var resources = this.getResources();
        for (var i = 0; i < this.steps.length; i++) {
            var step = this.steps[i];
            for (var j = 0; j < resources.length; j++) {
                var resource = resources[j];
                calc.addBest(step.best[resource], resource);
                calc.addAvg(step.values[resource], resource, step.rate);
                calc.addWorst(step.worst[resource], resource);
                this.best[resource] = this.calcMin(
                        step.rate,
                        step.best[resource] || 0,
                        this.best[resource] || null
                );
                this.values[resource] = this.calcAvg(
                        step.rate,
                        parseFloat(newValue) * parseFloat(rate)  ,
                        this.values[resource] || null
                );
                this.worst[resource] = this.calcMax(
                        step.rate,
                        step.worst[resource] || 0,
                        this.worst[resource] || null
                );
            }
        }
        this.best = calc.abest;
        this.values = calc.avalues;
        this.worst = calc.aworst;
    };

    function NodeCalculator() {
        this.abest = {};
        this.avalues = {};
        this.aworst = {};

        this.addBest = function(value, resource) {
            if (value) {
                this.abest[resource] = parseFloat(parseFloat(value) + parseFloat(this.abest[resource] || 0));
            }
        };
        this.addAvg = function(value, resource, rate) {
            if (value) {
                this.avalues[resource] = parseFloat(parseFloat(value) + parseFloat(this.avalues[resource] || 0));
            }
        };
        this.addWorst = function(value, resource) {
            if (value) {
                this.aworst[resource] = parseFloat(parseFloat(value) + parseFloat(this.aworst[resource] || 0));
            }
        };

    }

    this.makeCalculator = function () {
        return new NodeCalculator()
    };

    this.calcMin = function (rate, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) + parseFloat(oldValue || 0));
    };
    this.calcAvg = function (rate, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) + parseFloat(oldValue || 0));
    };
    this.calcMax = function (rate, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) + parseFloat(oldValue || 0));
    };

    this.removeStep = function (step) {
        this.steps.remove(step);
        this.resolve();
        this.onUpdate();
    };

    this.removeSelf = function () {
        this.parent.removeStep(this);
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
        return this.type == "L";
    };

    this.isSwitch = function () {
        return this.type == "S";
    };

    this.isSplit = function () {
        return this.type == "F";
    };

    this.isRoutine = function () {
        return this.type == "R";
    };

    this.isScenario = function () {
        return this.type == "C";
    };

    this.isCase = function () {
        return this.parent && this.parent.isSwitch();
    };

    this.getClass = function () {
        return (this.isParent() ? " parent-li" : "" + " last-child") + (this.inconsistent ? " invalid" : "");
    };

    this.theme = function () {
        return this.inconsistent ? " md-warn" : this.iscompleted ? "md-primary" : "md-accent";
    }

}

function EGMLink(id, parent) {
    this.id = id;
    this.scenarioId = null;
    this.scenario = null;
    this.name = "";
    this.parent = parent;
    this.steps = [];

    this.availableChildren = [];

    this.values = {};
    this.best = {};
    this.worst = {};

    this.setScenario = function (scenario) {
        this.scenario = scenario;
        this.name = scenario.name;
        this.values = scenario.values;
        this.best = scenario.best;
        this.worst = scenario.worst;
        scenario.addLink(this);
    };

    this.doCreateDTO = function (result) {
        result.scenarioId = this.scenario.id;
        return result;
    };

    this.doSetDTO = function (memento) {
        this.scenarioId = memento.scenarioId;

    };

    this.init = function () {
        this.setScenario(this.findScenario(this.scenarioId));
    };

    this.image = function () {
        return "script.svg";
    };

    this.update = function () {
        this.values = this.scenario.values;
        this.best = this.scenario.best;
        this.worst = this.scenario.worst;
        parent.resolve();
    };

    this.removeSelf = function () {
        this.parent.removeStep(this);
        this.scenario.removeLink(this);
    };
}
EGMLink.prototype = new EGMStep("C");

function EGMScenario(id, model) {

    this.id = id;
    this.name = "Scenario";
    this.model = model;
    this.parent = null;

    this.values = {};
    this.best = {};
    this.worst = {};
    this.steps = [];
    this.stepNo = 0;
    this.link = null;

    this.dropOptions = {
        onDrop: function (dragEl) {
            alert(dragEl);
        }
    };

    this.onUpdate = function () {
        if (this.link) {
            this.link.update();
        }
    };

    this.image = function () {
        return "script.svg";
    };

    this.addLink = function (link) {
        this.link = link;
    };


    this.removeLink = function (link) {
        if (this.link === link) {
            this.link = null;
        }
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
        )
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
        if (this.link) {
            this.link.removeSelf();
        }
    };
}
EGMScenario.prototype = new EGMStep("C");

function EGMRoutine(id, parent, name) {
    this.id = id;
    this.name = name || "Step";
    this.parent = parent;

    this.rate = 1;
    this.values = {};
    this.best = {};
    this.worst = {};
    this.steps = [];
    this.stepNo = 0;

    this.image = function () {
        return this.isNode() ? "file-multiple.svg" : "file.svg";
    }
}
EGMRoutine.prototype = new EGMStep("R");

function EGMLoop(id, parent) {
    this.id = id;
    this.name = "Loop";
    this.parent = parent;

    this.repeat = 1;
    this.values = {};
    this.best = {};
    this.worst = {};
    this.steps = [];
    this.stepNo = 0;
    this.iscompleted = false;

    this.onUpdate = function () {
        this.iscompleted = this.steps.length > 0;
    };

    this.image = function () {
        return "block-helper.svg";
    };

    this.calcMin = function (rate, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) * parseFloat(this.repeat) + parseFloat(oldValue || 0));
    };
    this.calcAvg = function (rate, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) * parseFloat(this.repeat) + parseFloat(oldValue || 0));
    };
    this.calcMax = function (rate, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) * parseFloat(this.repeat) + parseFloat(oldValue || 0));
    }
}
EGMLoop.prototype = new EGMStep("L");

function EGMSwitch(id, parent) {
    this.id = id;
    this.name = "Switch";
    this.parent = parent;

    this.rate = 1;
    this.values = {};
    this.best = {};
    this.worst = {};
    this.steps = [];
    this.stepNo = 0;
    this.iscompleted = false;

    this.onUpdate = function () {
        this.iscompleted = this.steps.length > 0;
        this.inconsistent = this.totalProbability() > 1;
    };

    this.image = function () {
        return "source-fork.svg";
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

    this.calcMin = function (rate, newValue, oldValue) {
        if (this.totalProbability() < 1) {
            return 0;
        }
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber < oldNumber ? newNumber : oldNumber;
    };
    this.calcAvg = function (rate, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) * parseFloat(rate) + oldValue ? parseFloat(oldValue) : 0);
    };
    this.calcMax = function (rate, newValue, oldValue) {
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber > oldNumber ? newNumber : oldNumber;
    }
}
EGMSwitch.prototype = new EGMStep("S");

function EGMSplit(id, parent) {
    this.id = id;
    this.name = "Split";
    this.parent = parent;

    this.rate = 1;
    this.values = {};
    this.best = {};
    this.worst = {};
    this.steps = [];
    this.stepNo = 0;
    this.iscompleted = false;

    this.onUpdate = function () {
        this.iscompleted = this.steps.length > 1;
    };

    this.image = function () {
        return "view-agenda.svg";
    };

    this.calcMin = function (rate, newValue, oldValue) {
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber < oldNumber ? newNumber : oldNumber;
    };
    this.calcAvg = function (rate, newValue, oldValue) {
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber < oldNumber ? newNumber : oldNumber;
    };
    this.calcMax = function (rate, newValue, oldValue) {
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber < oldNumber ? newNumber : oldNumber;
    }
}
EGMSplit.prototype = new EGMStep("F");


function EGMPardo(id, parent) {
    this.id = id;
    this.name = "Pardo";
    this.parent = parent;

    this.rate = 1;
    this.values = {};
    this.best = {};
    this.worst = {};
    this.steps = [];
    this.stepNo = 0;
    this.iscompleted = false;

    this.onUpdate = function () {
        this.iscompleted = this.steps.length > 1;
    };

    this.image = function () {
        return "view-dashboard.svg";
    };

    this.calcMin = function (rate, newValue, oldValue) {
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber > oldNumber ? newNumber : oldNumber;
    };
    this.calcAvg = function (rate, newValue, oldValue) {
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber > oldNumber ? newNumber : oldNumber;
    };
    this.calcMax = function (rate, newValue, oldValue) {
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber > oldNumber ? newNumber : oldNumber;
    }
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
        memento.resourcesNo = this.resourcesNo;
        memento.scenarioNo = this.scenarioNo;
        memento.resources = createArrayDTO(this.resources);
        memento.scenarios = createArrayDTO(this.scenarios);
        return memento;
    };

    this.setDTO = function (memento) {
        this.id = memento.id;
        this.name = memento.name;

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
            this.scenarios[i].init();
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
            if (this.scenarios[i].id == id) {
                return this.scenarios[i];
            }
        }
        return null;
    };

    this.removeScenario = function (scenario) {
        this.scenarios.remove(scenario);
    };


}


