'use strict';

/* App Module */

var pmc = angular.module(
    'pmc',
    [
        'ngRoute',
        'ngMaterial',

        'pmc.services',
        'pmc.directives',
        'pmc.controllers',
        'pmc.filters'

    ],
    function ($httpProvider) {
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
);


pmc.config(
    [
        '$routeProvider',
        function ($routeProvider) {

            $routeProvider.
                when('/projects', {
                    templateUrl: 'views/projects.html',
                    controller: 'ProjectListCtrl'
                }).
                when('/project/:projectId', {
                    templateUrl: 'views/project-details.html',
                    controller: 'ProjectCtrl'
                }).
                when('/chart/:projectId/:modelId', {
                    templateUrl: 'views/bounds.html',
                    controller: 'ChartCtrl'
                }).
                when('/compare', {
                    templateUrl: 'views/compare.html',
                    controller: 'ComparatorCtrl'
                }).
                otherwise({
                    redirectTo: '/project/new'
                });
        }
    ]
);


pmc.config(
    [
        '$mdThemingProvider',
        function ($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('green');
            $mdThemingProvider.theme('docs-dark', 'default')
                .primaryPalette('yellow')
                .accentPalette('purple')
                .warnPalette('red')
                .backgroundPalette('grey')
                .dark();
        }]);




