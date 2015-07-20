'use strict';

/* Controllers */

angular.module('pmc.controllers', [])

    .controller('ProjectCtrl', function ($scope, projectProvider, modelFactory, messageProvider) {

        $scope.project = new Project("New Performance Model", uuid());

        projectProvider.setProject($scope.project);

        $scope.remove = function () {
            projectProvider.remove();
        };

        $scope.reset = function () {
            projectProvider.reset();
        };

        $scope.load = function () {
            projectProvider.load();
        };

        $scope.save = function () {
            projectProvider.save();
        };

        $scope.addQNM = function () {
            $scope.project.models.push(modelFactory.qnm("QNM " + $scope.project.models.length));
        };

        $scope.addEGM = function () {
            $scope.project.models.push(modelFactory.egm("EGM " + $scope.project.models.length));
        };

        $scope.addQNM();

    })

    .controller('MsgCtrl', function ($scope, messageProvider) {

        $scope.alerts = [];
        messageProvider.setAlerts($scope.alerts);

        $scope.closeAlert = function (index) {
            messageProvider.close(index);
        };

    })

    .controller('EGMCtrl', function ($scope, messageProvider) {

        $scope.addResource = function () {
            $scope.model.addResource();
        };

        $scope.removeResource = function (resource) {
            $scope.model.removeResource(resource);
        };

        $scope.addScenario = function () {
            $scope.model.addScenario();
        };

        $scope.removeScenario = function (scenario) {
            $scope.model.removeScenario(scenario);
        };

    })

    .controller('QNMCtrl', function ($scope, messageProvider) {

        $scope.change = function (fieldName, center) {
            var model = $scope.model;
            messageProvider.clear();
            model.init();
            var changedField = new Parameter(fieldName, center);
            if (!model.calculate(changedField)) {
                messageProvider.error("Performance Model is not consistent");
            }
            if (!model.valid()) {
                messageProvider.error("Performance Model is invalid");
            }
        };

        $scope.addNode = function () {
            $scope.model.addNode();
            $scope.model.recalculate();
        };

        $scope.removeNode = function (node) {
            $scope.model.removeNode(node);
            $scope.model.recalculate();
        };

        $scope.addClass = function () {
            $scope.model.addClass();
            $scope.model.recalculate();
        };

        $scope.refreshCharts = function () {
            $scope.model.refreshCharts();
        };

        $scope.removeClass = function (clazz) {
            $scope.model.removeClass(clazz);
            $scope.model.recalculate();
        };

    })

    .controller('MainMenuCtrl', function ($scope, $modal) {
        $scope.about = function () {
            //noinspection JSUnusedLocalSymbols
            var modalInstance = $modal.open({
                templateUrl: 'aboutModalContent.html',
                controller: ModalInstanceCtrl
            });
        };
    })

    .controller('ProjectListCtrl', function ($scope, projectProvider) {

        $scope.init = function () {
            projectProvider.findAll();
        };

        $scope.getProjects = function () {
            return projectProvider.getProjects();
        };

        $scope.findAll = function () {
            projectProvider.findAll();
        };

        $scope.load = function (project) {
            projectProvider.load(project.name);
        };

        $scope.remove = function (project) {
            projectProvider.remove(project.name);
        };
    })

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance) {

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });