'use strict';

/* App Module */

var application = angular.module(
    'pmc',
    [
        'ngRoute',

        'pmc.services',
        'pmc.directives',
        'pmc.controllers',
        'pmc.filters'
    ],
    function ($httpProvider) {
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
);

application.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/projects', {
                templateUrl: 'views/projects.html',
                controller: 'ProjectListCtrl'
            }).
            when('/project/:projectId', {
                templateUrl: 'views/project-details.html',
                controller: 'ProjectCtrl'
            }).
            otherwise({
                redirectTo: '/project/new'
            });
    }]);
