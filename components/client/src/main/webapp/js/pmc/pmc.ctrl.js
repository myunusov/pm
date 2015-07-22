'use strict';

/* Controllers */

angular.module('pmc.controllers', [])


    .controller('ProjectCtrl', function ($scope, $mdDialog, projectProvider) {

        $scope.project = projectProvider.getProject();

        $scope.remove = function () {
            projectProvider.remove();
        };

        $scope.reset = function () {
            projectProvider.reset();
        };

        $scope.load = function () {
            projectProvider.load();
        };

        $scope.save = function () {
            projectProvider.save();
        };

        $scope.newModel = function (ev) {
            $mdDialog.show({
                clickOutsideToClose: true,
                controller: NewModelDialogController,
                templateUrl: 'views/new.dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
            })
                .then(function (answer) {
                    if (answer === "QNM") {
                        projectProvider.addQNM();
                    }
                    if (answer === "EGM") {
                        projectProvider.addEGM();
                    }
                }, function () {
                    return
                });
        };

        function NewModelDialogController($scope, $mdDialog) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };
        }

        $scope.addQNM = function () {
            projectProvider.addQNM();
        };

        $scope.addEGM = function () {
            projectProvider.addEGM();
        };

    })

    .controller('MsgCtrl', function ($scope, messageProvider) {

        $scope.alerts = [];
        messageProvider.setAlerts($scope.alerts);

        $scope.closeAlert = function (index) {
            messageProvider.close(index);
        };

    })

    .controller('EGMCtrl', function ($scope, messageProvider) {

        $scope.addResource = function () {
            $scope.model.addResource();
        };

        $scope.removeResource = function (resource) {
            $scope.model.removeResource(resource);
        };

        $scope.addScenario = function () {
            $scope.model.addScenario();
        };

        $scope.removeScenario = function (scenario) {
            $scope.model.removeScenario(scenario);
        };

    })

    .controller('QNMCtrl', function ($scope, messageProvider) {

        $scope.change = function (fieldName, center) {
            var model = $scope.model;
            messageProvider.clear();
            model.init();
            var changedField = new Parameter(fieldName, center);
            if (!model.calculate(changedField)) {
                messageProvider.error("Performance Model is not consistent");
            }
            if (!model.valid()) {
                messageProvider.error("Performance Model is invalid");
            }
        };

        $scope.addNode = function () {
            $scope.model.addNode();
            $scope.model.recalculate();
        };

        $scope.removeNode = function (node) {
            $scope.model.removeNode(node);
            $scope.model.recalculate();
        };

        $scope.addClass = function () {
            $scope.model.addClass();
            $scope.model.recalculate();
        };

        $scope.refreshCharts = function () {
            $scope.model.refreshCharts();
        };

        $scope.removeClass = function (clazz) {
            $scope.model.removeClass(clazz);
            $scope.model.recalculate();
        };

    })

    .controller('MainMenuCtrl', function ($scope, $timeout, $mdSidenav, $mdUtil, $mdDialog, $log) {

        $scope.triger = false;

        $scope.toggleLeft = buildToggler('left');

        $scope.toggleRight = buildToggler('right');
        /**
         * Build handler to open/close a SideNav; when animation finishes
         * report completion in console
         */
        function buildToggler(navID) {
            return $mdUtil.debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        $log.debug("toggle " + navID + " is done");
                    });
            }, 300);
        }

        $scope.toggleFullScreen = function () {
            $scope.triger = window.screenTop || window.screenY;
            if (window.screenTop || window.screenY) {
                if (document.documentElement.requestFullScreen) {
                    document.documentElement.requestFullScreen();
                }
                else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                }
                else if (document.documentElement.webkitRequestFullScreen) {
                    document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                }
            } else {
                if (document.cancelFullScreen) {
                    document.cancelFullScreen();
                }
                else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                }
                else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
            }

        };

        $scope.fullScreenClass = function () {
            return $scope.triger ? "mdi-arrow-collapse" : "mdi-arrow-expand";
        };

        $scope.showAbout = function (ev) {
            $mdDialog.show({
                clickOutsideToClose: true,
                controller: AboutDialogController,
                templateUrl: 'views/about.dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
            })
                .then(function (answer) {
                    $scope.alert = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.alert = 'You cancelled the dialog.';
                });
        }


        function AboutDialogController($scope, $mdDialog) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };
        }


    })

    .controller('ProjectListCtrl', function ($scope, projectProvider) {

        $scope.init = function () {
            projectProvider.findAll();
        };

        $scope.getProjects = function () {
            return projectProvider.getProjects();
        };

        $scope.findAll = function () {
            projectProvider.findAll();
        };

        $scope.load = function (project) {
            projectProvider.load(project.name);
        };

        $scope.remove = function (project) {
            projectProvider.remove(project.name);
        };
    })

    .controller('ModalCtrl', function ($scope, projectProvider) {

        $scope.addQNM = function () {
            projectProvider.addQNM();
        };

        $scope.addEGM = function () {
            projectProvider.addEGM();
        };


    })

    .controller('LeftSidebarCtrl', function ($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function () {
            $mdSidenav('left').close()
                .then(function () {
                    $log.debug("close LEFT is done");
                });
        };
    });




