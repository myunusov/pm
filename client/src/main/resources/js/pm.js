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

angular.module('pm.service', []);


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

function QNMCtrl($scope, qnmFactory) {

    $scope.alerts = [];

    $scope.clearAlerts = function() {
        $scope.alerts = [];
    };

    $scope.inconsistentAlert = function() {
        if ($scope.alerts.length === 0) {
            $scope.alerts.push({type: 'error', msg: "Error! Performance Model is not consistent"});
        }
    };

    $scope.model = qnmFactory.qnm();


    $scope.fields = [];
    // $scope.fields = $scope.model.getFieldsSeqBy([]); TODO add new node or source must recalculate model

    $scope.change = function (fieldName, element) {

        var changedField = new Parameter(fieldName, element);
        if (changedField.isUndefined()) {
            return;
        }
        $scope.clearAlerts();
        $scope.model.init();

        if ($scope.fields.contains(changedField)) {
            $scope.fields.remove(changedField);
        }
        $scope.fields.push(changedField);

        var calculator  = $scope.model.makeCalculator($scope.fields);

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
    };
}