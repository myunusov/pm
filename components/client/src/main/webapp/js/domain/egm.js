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
    this.type = type;
    this.rate = 1;
    this.repeat = 1;
    this.values = {};
    this.best = {};
    this.worst = {};
    this.steps = [];
    this.stepNo = 0;

    this.setDTO = function (memento) { // TODO
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
                step = new EGMFork(
                    memento.steps[i].id,
                    this
                );
            } else if (memento.steps[i].type === "S") {
                step = new EGMSwitch(
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
        {id: "F", title: "Fork"}
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
                step = new EGMFork(id2, this);
                break;
            default:
                step = new EGMRoutine(id2, this);
        }
        this.steps.push(step);
    };

    this.change = function () {
        this.worst = this.values;
        this.best = this.values;
        if (this.parent) {
            this.parent.resolve();
        }
    };

    this.resolve = function () {
        this.values = {};
        this.worst = {};
        this.best = {};
        for (var i = 0; i < this.steps.length; i++) {
            this.updateBest(this.steps[i]);
            this.updateAvg(this.steps[i]);
            this.updateWorst(this.steps[i]);
        }
        if (this.parent) {
            this.parent.resolve();
        }
    };

    this.recalc = function () {
        if (this.steps.length > 0) {
            for (var i = 0; i < this.steps.length; i++) {
                this.steps[i].recalc();
            }
            this.resolve();
        } else {
            this.worst = this.values;
            this.best = this.values;
        }
    };

    this.updateBest = function (child) {
        for (var key in child.best) {
            var newValue = child.best.hasOwnProperty(key) && child.best[key] ? child.best[key] : 0;
            var oldValue = this.best.hasOwnProperty(key) && this.best[key] ? this.best[key] : null;
            this.best[key] =  this.calcMin(child, newValue, oldValue);
        }
    };

    this.updateAvg = function (child) {
        for (var key in child.values) {
            var newValue = child.values.hasOwnProperty(key) && child.values[key] ? child.values[key] : 0;
            var oldValue = this.values.hasOwnProperty(key) && this.values[key] ? this.values[key] : null;
            this.values[key] =  this.calcAvg(child, newValue, oldValue);
        }
    };

    this.updateWorst = function (child) {
        for (var key in child.worst) {
            var newValue = child.worst.hasOwnProperty(key) && child.worst[key] ? child.worst[key] : 0;
            var oldValue = this.worst.hasOwnProperty(key) && this.worst[key] ? this.worst[key] : null;
            this.worst[key] =  this.calcMax(child, newValue, oldValue);
        }
    };

    this.calcMin = function (child, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) + parseFloat(oldValue ? oldValue : 0));
    }
    this.calcAvg = function (child, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) + parseFloat(oldValue ? oldValue : 0));
    }
    this.calcMax = function (child, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) + parseFloat(oldValue ? oldValue : 0));
    }

    this.removeStep = function (step) {
        this.steps.remove(step);
        this.resolve();
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

    this.isFork = function () {
        return this.type == "F";
    };

    this.isRoutine = function () {
        return this.type == "R";
    };


    this.isCase = function () {
        return this.parent.isSwitch();
    };

    this.getClass = function () {
        return (this.isParent() ? " parent-li" : "" + " last-child")  + (this.inconsistent ? " invalid" : "");
    };

}

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

    this.allsSteps = function () {
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

    this.removeSelf = function () {
        this.model.removeScenario(this);
    };
}
EGMScenario.prototype = new EGMStep("ROOT");

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

    this.calcMin = function (child, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) * parseFloat(this.repeat) + parseFloat(oldValue ? oldValue : 0));
    }
    this.calcAvg = function (child, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) * parseFloat(this.repeat) + parseFloat(oldValue ? oldValue : 0));
    }
    this.calcMax = function (child, newValue, oldValue) {
        return parseFloat(parseFloat(newValue) * parseFloat(this.repeat) + parseFloat(oldValue ? oldValue : 0));
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

    this.totalProbability = function() {
        var result = 0;
        this.steps.each(
            function(step) {
                result += parseFloat(step.rate);
            }
        );
        this.inconsistent = result > 1;
        return result;
    }

    this.calcMin = function (child, newValue, oldValue) {
        if (this.totalProbability() < 1) {
            return 0;
        }
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber < oldNumber ? newNumber : oldNumber;
    }
    this.calcAvg = function (child, newValue, oldValue) {
        if (!oldValue) {
            return parseFloat(newValue) * parseFloat(child.rate);
        }
        return parseFloat(parseFloat(newValue) * parseFloat(child.rate) + parseFloat(oldValue));
    }
    this.calcMax = function (child, newValue, oldValue) {
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber > oldNumber ? newNumber : oldNumber;
    }
}
EGMSwitch.prototype = new EGMStep("S");

function EGMFork(id, parent) {
    this.id = id;
    this.name = "Fork";
    this.parent = parent;

    this.rate = 1;
    this.values = {};
    this.best = {};
    this.worst = {};
    this.steps = [];
    this.stepNo = 0;

    this.calcMin = function (child, newValue, oldValue) {
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber < oldNumber ? newNumber : oldNumber;
    }
    this.calcAvg = function (child, newValue, oldValue) {
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber < oldNumber ? newNumber : oldNumber;
    }
    this.calcMax = function (child, newValue, oldValue) {
        var newNumber = parseFloat(newValue);
        if (!oldValue) {
            return newNumber;
        }
        var oldNumber = parseFloat(oldValue);
        return newNumber < oldNumber ? newNumber : oldNumber;
    }
}
EGMFork.prototype = new EGMStep("F");


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
            this.scenarios[i].recalc();
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
    };

    this.removeScenario = function (scenario) {
        this.scenarios.remove(scenario);
    };


}


