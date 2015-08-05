'use strict';

/* App Module */

var pmc = angular.module(
    'pmc',
    [
        'ui.router',
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


pmc.config(['$urlRouterProvider',
        function ($urlRouterProvider) {
            $urlRouterProvider.otherwise(
                function ($injector, $location) {
                    $location.path('/project/' + uuid() + "/new");
                });
        }
    ]
);

pmc.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('projects', {
                    url: '/projects',
                    templateUrl: 'views/projects.html',
                    controller: 'ProjectListCtrl',
                    resolve:{
                        simpleObj:  function(){
                            return {value: 'simple!'};
                        }
                    }
                })
                .state('project', {
                    url: '/project/:projectId/{action}',
                    templateUrl: 'views/project-details.html',
                    controller: 'ProjectCtrl',
                    resolve:{
                        simpleObj:  function(){
                            return {value: 'simple!'};
                        }
                    }
                })
                .state('chart', {
                    url: '/chart/:projectId/:modelId',
                    templateUrl: 'views/bounds.html',
                    controller: 'ChartCtrl'
                })
                .state('compare', {
                    url: '/compare',
                    templateUrl: 'views/compare.html',
                    controller: 'ComparatorCtrl'
                });
        }
    ]
);

pmc.config(['$mdThemingProvider',
        function ($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('green');
            $mdThemingProvider.theme('docs-dark', 'default')
                .primaryPalette('yellow')
                .accentPalette('purple')
                .warnPalette('red')
                .backgroundPalette('grey')
                .dark();
        }
    ]
);



