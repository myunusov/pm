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
                    case 403: return "The server is refusing to respond to request";
                    case 404: return "The requested resource could not be found";
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
                        if (errorcode) {
                            message += " " + getMessageBy(errorcode);
                        }
                        alerts.push({type: 'error', msg: message});
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
            var url = '../rest/services/';
            return {
                getModel: function () {
                    return model;
                },
                setModel: function (value) {
                    model = value;
                },
                load: function (id) {
                    messageProvider.clear();
                    $http.get(url + 'load' + '/' + id)
                            .success(function (dto) {
                                model.setDTO(dto);
                                messageProvider.error("Performance Model is loaded");
                            })
                            .error(function (data, status) {
                                messageProvider.error("Error! Performance Model is not loaded", status);
                            });
                },
                save: function (id) {
                    messageProvider.clear();
                    model.id = id;
                    var dto = model.createDTO();
                    $http.post(url + 'save', JSON.stringify(dto))
                            .success(function (data) {
                                messageProvider.error("Performance Model is not saved");
                            })
                            .error(function (data, status) {
                                messageProvider.error("Error! Performance Model is not saved.", status);
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
            var qnm = new QNM();
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
            messageProvider.error("Error! Performance Model is not consistent");
        }
        if (!model.valid()) {
            messageProvider.error("Error! Performance Model is invalid");
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
        var id = 'model 1';
        modelProvider.load(id);
    };

    $scope.save = function () {
        // var id = getModelId() // TODO get model name from dialog
        var id = 'model 1';
        modelProvider.save(id);

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