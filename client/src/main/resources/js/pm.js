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


angular.module('pm.directive', [])
        .directive('utilization', function () {
            return {
                require: 'ngModel',
                link: function (scope, element, attrs, ngModelController) {
                    ngModelController.$parsers.push(
                            function (data) {
                                if (!number(data)) {
                                    return data;
                                }
                                switch (scope.model.timeUnit) {
                                    case 'percent':
                                        return parseFloat((data / 100).toPrecision(10));
                                    case 'rate':
                                        return parseFloat(data.toPrecision(10));
                                }
                                return null;
                            }
                    );
                    ngModelController.$formatters.push(
                            function (data) {
                                if (!number(data)) {
                                    return data;
                                }
                                switch (scope.model.timeUnit) {
                                    case 'percent':
                                        return parseFloat((data * 100).toPrecision(5));
                                    case 'rate':
                                        return parseFloat(data.toPrecision(5));
                                }
                                return null;
                            }
                    );
                }
            };
        })
        .directive('utilization', function() {
            return {
                restrict: 'E',
                require: '^ngModel',
                template: '<div>\n    <input type="text" pattern="[\\d, \\., \\,]*"\n           class="input input-small simplebox"\n           ng-model="ngModel.value">\n                                <span class="numeric dropdown">\n                                <a class="dropdown-toggle">{{ngModel.unit === "rate" ? "rate" : "%"}}</a>\n                                <ul class="dropdown-menu">\n                                    <li ng-hide="ngModel.unit === \'percent\'"><a ng-click="ngModel.unit  = \'percent\'">%</a></li>\n                                    <li ng-hide="ngModel.unit === \'rate\'" ><a ng-click="ngModel.unit  = \'rate\'">rate</a></li>\n                                </ul>\n                                </span>\n</div>'
            }
        });



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
    $scope.model = qnmFactory.qnm();
}