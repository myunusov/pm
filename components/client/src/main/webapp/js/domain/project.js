function ProjectMemento() {
}

function Project(name, id) {

    this.id = id;
    this.name = name;
    this.version = 0;
    this.description = "";
    this.models = [];


    this.createDTO = function () {
        var memento = new ProjectMemento();
        memento.id = this.id;
        memento.name = this.name;
        memento.version = this.version;
        memento.description = this.description;
        memento.models = createArrayDTO(this.models);
        return  memento;
    };

    this.setDTO = function (memento) {
        this.id = memento.id;
        this.name = memento.name;
        this.version = memento.version;
        this.description = memento.description;
        this.models = [];
        for (var i= 0; i < memento.models.length; i++) {
            var model;
            if (memento.models[i].type === "qnm") {
                model = new QNM(
                        memento.models[i].name,
                        memento.models[i].id
                );
            } else if (memento.models[i].type === "egm") {
                model = new EGM(
                        memento.models[i].name,
                        memento.models[i].id
                );
            }
            model.setDTO(memento.models[i]);
            this.models.push(model);
        }
    };

    this.reset = function() {
        this.id = id;
        this.name = name;
        this.description = "";
        this.version = 0;
        this.models = [];
    };

    //noinspection JSUnusedGlobalSymbols
    this.removeModel = function (model) {
        this.models.remove(model);
    };

    this.getModel = function (id) {
        for (var i= 0; i < this.models.length; i++) {
            var model = this.models[i];
            if (model.id === id) {
                return model;
            }
        }
        return null;
    };

}