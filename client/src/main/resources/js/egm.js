function format (number) {
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
    this.type = type;
    this.values = {};

    this.steps = [];
    this.stepNo = 0;

    this.setDTO = function (memento) { // TODO
        this.id = memento.id;
        this.name = memento.name;
        this.type = memento.type;
        this.stepNo = memento.stepNo;
        this.values = memento.values;
        this.doSetDTO(memento);
        this.steps = [];
        for (var i= 0; i < memento.steps.length; i++) {
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
            } else if (memento.steps[i].type === "C") {
                step = new EGMCase(
                        memento.steps[i].id,
                        this
                );
            }
            step.setDTO(memento.steps[i]);
            this.steps.push(step);
        }
    };

    this.createDTO = function () {  // TODO
        var result = {
            id: this.id,
            name: this.name,
            type: this.type,
            stepNo: this.stepNo,
            values: this.values
        };
        result.steps = createArrayDTO(this.steps);
        return this.doCreateDTO(result);
    };

    this.doSetDTO = function(memento) {
    };


    this.doCreateDTO = function(result) {
        return result;
    };

    this.availableChildren = [
        {id: "R", title : "Routine"},
        {id: "L", title : "Loop"},
        {id: "S", title : "Switch"},
        {id: "F", title : "Fork"}
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
            case "C":
                step = new EGMCase(id2, this);
                break;
            default:
                step = new EGMRoutine(id2, this);
        }
        this.steps.push(step);
    };

    this.change = function(){
        if (this.parent) {
            this.parent.resolve();
        }
    };

    this.resolve = function(){
        var result = {};
        this.steps.each(
                function(child) {
                    for (var key in child.values) {
                        if (child.values.hasOwnProperty(key) && child.values[key]) {
                            result[key] = result[key] ?
                                    format(parseFloat(result[key]) + parseFloat(child.values[key])) :
                                    child.values[key];
                        }
                    }
                }
        );
        this.values = result;
        if (this.parent) {
            this.parent.resolve();
        }
    };

    this.removeStep = function (step) {
        this.steps.remove(step);
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

    this.isLoop = function(){
        return this.type == "L";
    };

    this.isCase = function(){
        return this.type == "C";
    };

    this.getClass = function() {
        return this.isParent() ? " parent-li" : "" + " last-child";
    };


}

function EGMScenario(id, model) {
    this.id = id;
    this.name = "Scenario";
    this.model = model;
    this.parent = null;
    this.steps = [];
    this.stepNo = 0;
    this.values = {};

    this.removeSelf = function () {
        this.model.removeScenario(this);
    };


}
EGMScenario.prototype = new EGMStep("ROOT");

function EGMRoutine(id, parent, name) {
    this.id = id;
    this.name = name || "Step";
    this.parent = parent;
    this.steps = [];
    this.stepNo = 0;
    this.values = {};
}
EGMRoutine.prototype = new EGMStep("R");

function EGMLoop(id, parent) {
    this.id = id;
    this.name = "Loop";
    this.parent = parent;
    this.stepNo = 1;
    this.steps = [];
    this.stepNo = 0;
    this.values = {};

    this.iterationNumber = 2;

    this.doSetDTO = function(memento) {
        this.iterationNumber = memento.iterationNumber;
    };

    this.doCreateDTO = function(result) {
        result.iterationNumber = this.iterationNumber;
        return result;
    };

    this.resolve = function(){
        var result = {};
        var iterationNumber = parseFloat(this.iterationNumber);
        this.steps.each(
                function(child) {
                    for (var key in child.values) {
                        if (child.values.hasOwnProperty(key) && child.values[key]) {
                            result[key] = result[key] ?
                                    format(parseFloat(result[key]) + parseFloat(child.values[key]) * iterationNumber) :
                                    format(child.values[key] * iterationNumber);
                        }
                    }
                }
        );
        this.values = result;
        if (this.parent) {
            this.parent.resolve();
        }
    };
}
EGMLoop.prototype = new EGMStep("L");

function EGMSwitch(id, parent) {
    this.id = id;
    this.name = "Switch";
    this.parent = parent;
    this.stepNo = 1;
    var id2 = this.id + "." + ++this.stepNo;
    this.steps = [new EGMCase(id2, this)];
    this.values = {};

    this.availableChildren = [
        {id: "C", title : "Case"}
    ]
}
EGMSwitch.prototype = new EGMStep("S");

function EGMCase(id, parent) {
    this.id = id;
    this.name = "Case";
    this.parent = parent;
    this.stepNo = 0;
    this.steps = [];
    this.values = {};
    this.probability = 1;

    this.doSetDTO = function(memento) {
        this.probability = memento.probability;
    };

    this.doCreateDTO = function(result) {
        result.probability = this.probability;
        return result;
    };

    this.resolve = function(){
        var result = {};
        var probability = parseFloat(this.probability);
        this.steps.each(
                function(child) {
                    for (var key in child.values) {
                        if (child.values.hasOwnProperty(key) && child.values[key]) {
                            result[key] = result[key] ?
                                    format(parseFloat(result[key]) + parseFloat(child.values[key]) * probability) :
                                    format(child.values[key] * probability);
                        }
                    }
                }
        );
        this.values = result;
        if (this.parent) {
            this.parent.resolve();
        }
    };
}
EGMCase.prototype = new EGMStep("C");

function EGMFork(id, parent) {
    this.id = id;
    this.name = "Fork";
    this.parent = parent;
    this.stepNo = 0;
    this.steps = [];
    this.values = {};

    this.resolve = function(){
        var result = {};
        this.steps.each(
                function(child) {
                    for (var key in child.values) {
                        if (child.values.hasOwnProperty(key) && child.values[key]) {
                            result[key] = result[key] ?
                                    (
                                            parseFloat(result[key]) > parseFloat(child.values[key]) ?
                                                    parseFloat(result[key]) :
                                                    parseFloat(child.values[key])
                                    ) :
                            child.values[key];
                        }
                    }
                }
        );
        this.values = result;
        if (this.parent) {
            this.parent.resolve();
        }
    };

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
        return  memento;
    };

    this.setDTO = function (memento) {
        this.id = memento.id;
        this.name = memento.name;

        this.resources = [];
        for (var i1= 0; i1 < memento.resources.length; i1++) {
            var resource = new EGMResource(
                    memento.resources[i1].id,
                    memento.resources[i1].name

            );
            resource.setDTO(memento.resources[i1]);
            this.resources.push(resource);
        }

        this.scenarios = [];
        for (var i2= 0; i2 < memento.scenarios.length; i2++) {
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
        for (var i= 0; i < this.scenarios.length; i++) {
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
    };

    this.removeScenario = function (scenario) {
        this.scenarios.remove(scenario);
    };


}


