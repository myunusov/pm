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

angular.module('pm.service', []).
        service('modelProvider', function ($http) {
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
                    $http.get(url + 'load' + '/' + id)
                            .success(function (dto) {
                                model.setDTO(dto);
                            })
                            .error(function (data) {
                            });
                },
                save: function (id) {
                    model.id = id;
                    $http.post(url + 'save', JSON.stringify(model.createDTO()))
                            .success(function (data) {
                            })
                            .error(function (data) {
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


function QNMCtrl($scope, qnmFactory, modelProvider) {

    $scope.alerts = [];

    $scope.clearAlerts = function() {
        $scope.alerts = [];
    };

    $scope.inconsistentAlert = function() {
        if ($scope.alerts.length === 0) {
            $scope.alerts.push({type: 'error', msg: "Error! Performance Model is not consistent"});
        }
    };
                               $scope.invalidAlert = function() {
        if ($scope.alerts.length === 0) {
            $scope.alerts.push({type: 'error', msg: "Error! Performance Model is invalid"});
        }
    };

    $scope.model = qnmFactory.qnm();
    modelProvider.setModel($scope.model);

    $scope.change = function (fieldName, element) {
        var model =  modelProvider.getModel();
        $scope.clearAlerts();
        model.init();
        var calculator  = model.makeCalculator(fieldName, element);
        if (!calculator) {
            return;
        }
        for (var result = null; result || calculator.next();) {
            result = calculator.execute();
            if (calculator.error) {
                $scope.inconsistentAlert();
                return;
            }
        }
        if (!model.valid()) {
            $scope.invalidAlert();
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