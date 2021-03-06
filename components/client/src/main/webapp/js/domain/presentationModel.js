function PresentationModel() {
    "use strict";

    this.compareModels = [];
    this.visibleModels = [];
    this.currentModelIndex = 0;

    function selectModelsByIds(project, ids) {
        var result = [];
        for (var i = 0; i < ids.length; i++) {
            var model = project.findModelById(ids[i]);
            if (model != null) {
                result.push(model);
            }
        }
        return result;
    }

    function selectIdsFromModels(models) {
        var result = [];
        for (var i = 0; i < models.length; i++) {
            result.push(models[i].id);
        }
        return result;
    }


    this.createDTO = function () {
        var view = {};
        view.currentModelIndex = this.currentModelIndex;
        view.visibleModels = selectIdsFromModels(this.visibleModels);
        view.compareModels = selectIdsFromModels(this.compareModels);
        return view;
    };
    this.setDTO = function (view, project) {
        this.currentModelIndex = view.currentModelIndex;
        this.compareModels = selectModelsByIds(project, view.compareModels);
        this.visibleModels = selectModelsByIds(project, view.visibleModels);
    };
    this.currentModel = function () {
        var idx = this.visibleModels.length == 1 ? 0 : this.currentModelIndex;
        return this.visibleModels[idx];
    };
    this.addCompareModel = function (model) {
        this.compareModels.push(model);
        this.compareModels = this.compareModels.unique();
    };
    this.removeCompareModel = function (model) {
        this.compareModels.remove(model);
    };
    this.hide = function (model) {
        this.visibleModels.remove(model);
    };
    this.open = function (model) {
        for (var i = 0; i < this.visibleModels.length; i++) {
            if (this.visibleModels[i].id === model.id) {
                this.currentModelIndex = i;
                return;
            }
        }
        this.visibleModels.push(model);
        this.currentModelIndex = this.visibleModels.length - 1;
    };
    this.reinit = function () {
        this.currentModelIndex = this.visibleModels.length - 1;
    };

    this.init = function (models) {
        this.compareModels = [];
        this.visibleModels = models.clone();
        this.currentModelIndex = this.visibleModels.length - 1;
    };

}