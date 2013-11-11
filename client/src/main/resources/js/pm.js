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
            var alerts = null;
            function getMessageBy(errorcode) {
                switch (parseFloat(errorcode)) {
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
        .service('modelProvider', function ($http, messageProvider) {
            var model = null;
            var url = '../rest/services/qnm';
            return {
                getModel: function () {
                    return model;
                },
                setModel: function (value) {
                    model = value;
                },
                load: function (name) {
                    messageProvider.clear();
                    $http.get(url + '/' + name)
                            .success(function (dto) {
                                model.setDTO(dto);
                                messageProvider.info("Performance Model '" + dto.name +"' is loaded.");
                            })
                            .error(function (data, status) {
                                messageProvider.error(data || "Performance Model is not loaded.", status);
                            });
                },
                delete: function (name) {
                    messageProvider.clear();
                    $http.delete(url + '/' + name)
                            .success(function (dto) {
                                messageProvider.info("Performance Model '" + dto.name +"' is deleted.");
                            })
                            .error(function (data, status) {
                                messageProvider.error(data || "Performance Model is not deleted.", status);
                            });
                },
                save: function (name) {
                    messageProvider.clear();
                    model.name = name;
                    var dto = model.createDTO();
                    $http.post(url, JSON.stringify(dto))
                            .success(function (data, status) {
                                if (status && parseFloat(status) === 201) {
                                    model.version = model.version + 1;
                                    messageProvider.info("Performance Model is saved as '" + data + "'.");
                                } else {
                                    messageProvider.error(data, status);
                                }
                            })
                            .error(function (data, status) {
                                messageProvider.error(data || "Performance Model is not saved.", status);
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
        qnm: function() {
            var qnm = new QNM("New QN Model", uuid());
            qnm.addNode();
            qnm.addSource();
            return  qnm;
        }
    };
});


function QNMCtrl($scope, qnmFactory, modelProvider, messageProvider) {

    $scope.alerts = [];
    messageProvider.setAlerts($scope.alerts);

    $scope.model = qnmFactory.qnm();
    modelProvider.setModel($scope.model);

    $scope.closeAlert = function(index) {
        messageProvider.close(index);
    };

    $scope.change = function (fieldName, center) {
        var model =  modelProvider.getModel();
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
}

function MainCtrl($scope, $modal, modelProvider) {

    $scope.about = function () {
        var modalInstance = $modal.open({
            templateUrl: 'myModalContent.html',
            controller: ModalInstanceCtrl
        });
    };

    $scope.load = function () {
        // var id = getModelId() // TODO get model name from dialog
        var name = 'model 1';
        modelProvider.load(name);
    };

    $scope.save = function () {
        // var id = getModelId() // TODO get model name from dialog
        var name = 'model 1';
        modelProvider.save(name);

    };

}

function ProjectCtrl($scope, modelProvider) {

    $scope.projects = [{name: 'model 1'}, {name: 'model 2'}, {name: 'model 3'}, {name: 'model 4'}, {name: 'model 5'}];

    $scope.load = function (project) {
        modelProvider.load(project.name);
    };

    $scope.delete = function (project) {
        modelProvider.delete(project.name);
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