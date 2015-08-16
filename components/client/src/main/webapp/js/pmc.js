'use strict';

/* App Module */

var pmc = angular.module(
    'pmc',
    [
        'ui.router',
        'ngResource',
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
                .state('chart', {
                    url: '/chart/:projectId/:modelId',
                    templateUrl: 'views/bounds.html',
                    controller: 'ChartCtrl',
                    resolve: {
                        currentModel: function ($stateParams, project, projectService) {
                            var projectId = $stateParams.projectId;
                            var modelId = $stateParams.modelId;
                            if (project.id && project.id === projectId) {
                                return project.getModel(modelId);
                            }
                            var prj = projectService.findBy(projectId);
                            if (prj === null) {
                                return null;
                            }
                            return project.clone(prj).getModel(modelId);
                        }
                    }
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



