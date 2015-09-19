'use strict';

/* App Module */

var pmc = angular.module(
    'pmc',
    [
        'ui.router',
        'ngResource',
        'ngSanitize',
        'ngMaterial',

        'mxObjects',

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
                    var projectService = $injector.get('projectService');
                    var project = $injector.get('project');
                    var id;
                    if (project.id) {
                        id = project.id;
                    } else {
                        id = uuid();
                        project.clone(projectService.make(id));
                    }
                    $location.path("project/" + id).replace();
                });
        }
    ]
);

pmc.config([
        '$stateProvider',
        function ($stateProvider) {

            $stateProvider
                .state('project', {
                    url: '/project/:projectId',
                    templateUrl: 'views/project.html',
                    controller: 'ProjectCtrl',
                    resolve: {
                        currentProject: function ($stateParams, project, projectService) {
                            var id = $stateParams.projectId;
                            if (project.id && project.id === id) {
                                return project;
                            }
                            return project.clone(projectService.findBy(id));
                        }
                    }
                })
                .state('projects', {
                    url: '/projects',
                    templateUrl: 'views/projects.html',
                    controller: 'ProjectListCtrl',
                    resolve: {
                        remoteProjects: function (projectService) {
                            return projectService.findRemoteProjects();
                        },
                        localProjects: function (projectService) {
                            return projectService.findLocalProjects();
                        }
                    }
                })
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



