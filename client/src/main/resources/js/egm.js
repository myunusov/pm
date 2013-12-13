function EGMResource(id, name) {
    this.id = id;
    this.name = name || "Resource " + id;
}

function EGMStep(id, name, parent) {

    this.id = id;
    this.name = name;
    this.steps = [];
    this.url = "stepContent.html";
    this.parent = parent;
    this.isParent = false;
    this.stepNo = 0;

    this.addStep = function () {
        var id2 = this.id + "." + ++this.stepNo;
        var step = new EGMStep(id2, "Step " + id2, this);
        this.steps.push(step);
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
        return !this.isParent() && !this.isRoot();
    };

    this.getClass = function() {
        return this.isParent() ? " parent-li" : "" + " last-child";    // TODO
    }


}

function EGMScenario(id, name, model) {
    this.id = id;
    this.name = name;
    this.model = model;
    this.parent = null;
    this.steps = [];
    this.stepNo = 0;

    this.removeSelf = function () {
        this.model.removeScenario(this);
    };

}
EGMScenario.prototype = new EGMStep();


function EGM(name, id) {
    this.id = id;
    this.name = name;
    this.url = "egm.html";

    this.resources = [];
    this.scenarios = [];

    var resourcesNo = 0;
    var scenarioNo = 0;

    this.createDTO = function () {
        var memento = new Memento();
        memento.id = this.id;
        memento.name = this.name;
        memento.type = "egm";
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
        var scenario = new EGMScenario(++scenarioNo, "Scenario " + scenarioNo, this);
        this.scenarios.push(scenario);
    };

    this.removeScenario = function (scenario) {
        this.scenarios.remove(scenario);
    };


}


