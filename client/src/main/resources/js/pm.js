/*
 * Copyright (c) 2013 Maxim Yunusov
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

angular.module('pm.service', [])
        .service('messageProvider', function () {
            var alerts = [];
            function getMessageBy(errorcode) {
                switch (parseFloat(errorcode)) {
                    case 400: return "The request could not be understood by the server due to malformed syntax.";
                    case 403: return "The server is refusing to respond to request.";
                    case 404: return "The requested resource could not be found.";
                    case 409: return "The request could not be completed due to a conflict with the current state.";
                    default : return "Unknown error with code " + errorcode;
                }
            }
            return {
                setAlerts: function (value) {
                    alerts = value;
                },
                clear: function() {
                    alerts.length = 0;
                },
                close: function(index) {
                    alerts.splice(index, 1);
                },
                error: function(message, errorcode) {
                    if (alerts.length === 0) {
                        var result = "Error!";
                        if (message instanceof Array) {
                            for (var i = 0; i < message.length; i++) {
                                result += " " + message[i];
                            }
                        } else {
                            result += " " + message;
                        }
                        if (errorcode) {
                            result +=  " " + getMessageBy(errorcode);
                        }
                        alerts.push({type: 'error', msg: result});
                    }
                },
                info: function(message) {
                    if (alerts.length === 0) {
                        alerts.push({type: 'success', msg: message});
                    }
                }
            };
        })
        .service('projectProvider', function ($http, messageProvider, qnmFactory) {
            var projects = [];
            var project = null;
            var url = 'services/projects';

            var remove = function(name) {
                for (var i = 0; i < projects.length; i++) {
                    if (projects[i].name === name) {
                        projects.remove(projects[i]);
                        break;
                    }
                }
            };
            return {
                getProjects: function () {
                    return projects;
                },
                setProject: function (value) {
                    project = value;
                },
                findAll: function () {
                    messageProvider.clear();
                    $http.get(url + '/')
                            .success(function (dto) {
                                projects = dto;
                            })
                            .error(function (data, status) {
                                messageProvider.error(
                                        data && data.message ?
                                                data.message :
                                                "Performance Model List is not loaded.", status);
                            });
                },
                load: function (name) {
                    name = name || project.name;
                    messageProvider.clear();
                    $http.get(url + '/' + name)
                            .success(function (dto) {
                                project.setDTO(dto);
                                messageProvider.info("Performance Model '" + dto.name +"' is loaded.");
                            })
                            .error(function (data, status) {
                                messageProvider.error(
                                        data && data.message ?
                                                data.message :
                                                "Performance Model is not loaded.", status);
                            });
                },
                reset: function () {
                   messageProvider.clear();
                    project.reset();
                    project.models.push(qnmFactory.qnm());
                },
                remove: function (name) {
                    name = name || project.name;
                    messageProvider.clear();
                    $http.delete(url + '/' + name)
                            .success(function (dto) {
                                messageProvider.info("Performance Model '" + dto.name +"' is deleted.");
                                remove(dto.name);
                                if (project.name === dto.name) {
                                    project.reset();
                                    project.models.push(qnmFactory.qnm());
                                }
                            })
                            .error(function (data, status) {
                                messageProvider.error(
                                        data && data.message ?
                                                data.message :
                                                "Performance Model is not deleted.", status);
                            });
                },
                save: function () {
                    messageProvider.clear();
                    var dto = project.createDTO();
                    $http.post(url, JSON.stringify(dto))
                            .success(function (dto, status) {
                                if (status && parseFloat(status) === 201) {
                                    project.version = dto.version;
                                    remove(dto.name);
                                    projects.push({
                                        id: dto.id,
                                        name: dto.name,
                                        version: dto.version
                                    });
                                    messageProvider.info("Performance Model is saved as '" + dto.name + "'.");
                                } else {
                                    messageProvider.error(dto.name, status);
                                }
                            })
                            .error(function (data, status) {
                                messageProvider.error(
                                        data && data.message ?
                                                data.message :
                                                "Performance Model is not saved.", status);
                            });
                }
            };
        });

angular.module('pm.directive', []);


angular.module('pm.filter', []);

var application = angular.module(
        'pm',
        [
            'ui.bootstrap',
            'pm.service',
            'pm.directive',
            'pm.filter'
        ],
        function ($httpProvider) {
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
        }
);

application.factory('qnmFactory', function() {
    return {
        qnm: function(name) {
            var qnm = new QNM(name || "QNM", uuid());
            qnm.addNode();
            qnm.addSource();
            return  qnm;
        }
    };
});

application.factory('egmFactory', function() {
    return {
        qnm: function(name) {
            var egm = new EGM(name || "EGM", uuid());
            return  egm;
        }
    };
});


function clickingCallback(e) {
    var children = $(this).closest('li.parent_li').find(' > ul > li');
    if (children.is(":visible")) {
        children.hide('fast');
        $(this).closest('span').find(' > i.icon-minus-sign').addClass('icon-plus-sign').removeClass('icon-minus-sign');
        $(this).closest('span').find(' > i.icon-folder-open').addClass('icon-folder-close').removeClass('icon-folder-open');
    } else {
        children.show('fast');
        $(this).closest('span').find(' > i.icon-plus-sign').addClass('icon-minus-sign').removeClass('icon-plus-sign');
        $(this).closest('span').find(' > i.icon-folder-close').addClass('icon-folder-open').removeClass('icon-folder-close');
    }
    e.stopPropagation();
}

application.directive('onCollapse', function() {
    return function(scope, element, attrs) {
        $(element).find(' > i').on('click', clickingCallback);
    }
});

//noinspection JSUnusedGlobalSymbols
function ProjectCtrl($scope, projectProvider, qnmFactory, egmFactory) {

    $scope.project = new Project("New Performance Model", uuid());

    $scope.project.models.push(qnmFactory.qnm());

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
        $scope.project.models.push(qnmFactory.qnm("QNM " + $scope.project.models.length));
    };

    $scope.addEGM = function () {
        $scope.project.models.push(egmFactory.qnm("EGM " + $scope.project.models.length));
    };

}

//noinspection JSUnusedGlobalSymbols
function MsgCtrl($scope, messageProvider) {

    $scope.alerts = [];
    messageProvider.setAlerts($scope.alerts);

    $scope.closeAlert = function(index) {
        messageProvider.close(index);
    };

}

function QNMCtrl($scope, messageProvider) {

    $scope.change = function (fieldName, center) {
        var model =  $scope.model;
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

    $scope.addSource = function () {
        $scope.model.addSource();
        $scope.model.recalculate();
    };

    $scope.removeSource = function (source) {
        $scope.model.removeSource(source);
        $scope.model.recalculate();
    };

}

//noinspection JSUnusedGlobalSymbols
function EGMCtrl($scope, messageProvider) {

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

}

//noinspection JSUnusedGlobalSymbols
function MainMenuCtrl($scope, $modal) {

    $scope.about = function () {
        //noinspection JSUnusedLocalSymbols
        var modalInstance = $modal.open({
            templateUrl: 'aboutModalContent.html',
            controller: ModalInstanceCtrl
        });
    };
}

//noinspection JSUnusedGlobalSymbols
function ProjectListCtrl($scope, projectProvider) {

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
}


function ModalInstanceCtrl($scope, $modalInstance) {

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}