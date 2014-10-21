function EGMResource(id, name) {
    this.id = id;
    this.name = name || "Resource " + id;
}

function EGMStep(type) {

    this.type = type;

    this.steps = [];
    this.url = "stepContent.html";
    this.isParent = false;
    this.stepNo = 0;

    this.values = {};

    this.title = function() {
        return this.id + " " + this.name;
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
                                    parseFloat(result[key]) + parseFloat(child.values[key]) :
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
    }

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

    this.resolve = function(){
        var result = {};
        var iterationNumber = parseFloat(this.iterationNumber);
        this.steps.each(
                function(child) {
                    for (var key in child.values) {
                        if (child.values.hasOwnProperty(key) && child.values[key]) {
                            result[key] = result[key] ?
                                    (parseFloat(result[key]) + parseFloat(child.values[key]) * iterationNumber)  :
                                    child.values[key] * iterationNumber;
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

    this.resolve = function(){
        var result = {};
        var probability = parseFloat(this.probability);
        this.steps.each(
                function(child) {
                    for (var key in child.values) {
                        if (child.values.hasOwnProperty(key) && child.values[key]) {
                            result[key] = result[key] ?
                                    (parseFloat(result[key]) + parseFloat(child.values[key]) * probability)  :
                            child.values[key] * probability;
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
        memento.resources = createArrayDTO(this.resources);
        memento.scenarios = createArrayDTO(this.scenarios);
        return  memento;
    };

    this.setDTO = function (memento) {
        this.id = memento.id;
        this.name = memento.name;
        this.init();
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


