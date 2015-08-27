"use strict";

function Project(name, id) {

    this.id = id;
    this.name = name;
    this.version = 0;
    this.description = "";
    this.models = [];

    this.visibleModels = [];
    this.currentModelIndex = 0;

    this.createDTO = function (memento) {
        memento.id = this.id;
        memento.name = this.name;
        memento.version = this.version;
        memento.description = this.description;
        memento.models = createArrayDTO(this.models);

        memento.visibleModels = [];
        for(var i = 0; i < this.visibleModels.length; i++) {
            memento.visibleModels.push(this.visibleModels[i].id);
        }
        memento.currentModelIndex = this.currentModelIndex;

        return memento;
    };

    this.setDTO = function (memento) {
        this.id = memento.id;
        this.name = memento.name;
        this.version = memento.version;
        this.description = memento.description;
        this.models = [];
        this.visibleModels = [];
        for (var i = 0; i < memento.models.length; i++) {
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
            for(var j = 0; j < memento.visibleModels.length; j++) {
                if (memento.visibleModels[j] === model.id)
                this.visibleModels.push(model);
            }
        }
        this.currentModelIndex = memento.currentModelIndex;
    };

    this.removeModel = function (model) {
        this.models.remove(model);
        this.visibleModels.remove(model);
    };

    this.addModel = function (model) {
        this.models.push(model);
        this.visibleModels.push(model);
    };

    this.findModelById = function(id) {
        for(var i = 0; i < this.models.length; i++) {
            if (this.models[i].id === id) {
                return this.models[i];
            }
        }
        return null;
    };

    this.openModel = function (model) {
        for(var i = 0; i < this.visibleModels.length; i++) {
            if (this.visibleModels[i].id === model.id) {
                this.currentModelIndex = i;
                return;
            }
        }
        this.visibleModels.push(model);
        this.currentModelIndex = this.visibleModels.length - 1;
    };


    this.getCurrentModel = function () {
        return this.visibleModels[this.currentModelIndex];
    };

    this.modelsBy = function(type) {
        var result =[];
        for (var i = 0; i < this.models.length; i++) {
            var model = this.models[i];
            if (model.type === type) {
                result.push(model);
            }
        }
        return result;
    };

    this.sems = function () {
        return this.modelsBy('egm');
    };

    this.qnms = function () {
        return this.modelsBy('qnm');
    };


    this.clone = function (project) {
        this.id = project.id;
        this.name = project.name;
        this.description = project.description;
        this.version = project.version;
        this.models = project.models;
        this.visibleModels = project.visibleModels;
        this.currentModelIndex = project.currentModelIndex;

        return this;
    };

}