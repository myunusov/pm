function ProjectMemento() {
}

function Project(name, id) {

    this.id = id;
    this.name = name;
    this.version = 0;
    this.models = [];


    this.createDTO = function () {
        var memento = new ProjectMemento();
        memento.id = this.id;
        memento.name = this.name;
        memento.version = this.version;
        memento.models = createArrayDTO(this.models);
        return  memento;
    };

    this.setDTO = function (memento) {
        this.id = memento.id;
        this.name = memento.name;
        this.version = memento.version;
        this.models = [];
        for (var i= 0; i < memento.models.length; i++) {
            var model = new QNM(
                    memento.models[i].name,
                    memento.models[i].id
            );
            model.setDTO(memento.models[i]);
            this.models.push(model);
        }
    };

    function createArrayDTO(array) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
            result.push(array[i].createDTO());
        }
        return result;
    }

    this.reset = function() {
        this.id = id;
        this.name = name;
        this.version = 0;
        this.models = [];
    };

    this.removeModel = function (model) {
        this.models.remove(model);
    }

}