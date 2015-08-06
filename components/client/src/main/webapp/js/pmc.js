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
                        projects:  function(){

                            // TODO


                            return {value: 'simple!'};
                        }
                    }
                })
                .state('project', {
                    url: '/project/:projectId/{action}',
                    templateUrl: 'views/project-details.html',
                    controller: 'ProjectCtrl',
                    resolve:{
                        project:  function($stateParams, projectProvider){
                            var id = $stateParams.projectId;
                            var action = $stateParams.action;
                            var currentProject = projectProvider.getProject();
                            if (id === null) {
                                window.location.replace("#project/" + currentProject.id);
                            }
                            if (currentProject && id === currentProject.id) {
                                return currentProject;
                            }
                            if (action === "new") {
                                return projectProvider.make(id);
                            }
                            projectProvider.load(id,
                                    function () {
                                        return projectProvider.getProject();
                                    },
                                    function () {
                                        var project;
                                        if (currentProject && currentProject.id) {
                                            project = currentProject;
                                        } else {
                                            project = projectProvider.make();
                                        }
                                        window.location.replace("#project/" + currentProject.id);
                                        return project;
                                    }
                            );
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



