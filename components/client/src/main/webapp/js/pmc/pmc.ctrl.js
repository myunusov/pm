'use strict';

/* Controllers */

angular.module('pmc.controllers', [])


        .controller('ProjectCtrl', function ($scope, $mdDialog, projectProvider, compareProvider) {

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
                    targetEvent: ev
                })
                        .then(function (answer) {
                            if (answer === "QNM") {
                                projectProvider.addQNM();
                            }
                            if (answer === "EGM") {
                                projectProvider.addEGM();
                            }
                        }, function () {
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

            $scope.addToCompare = function (model) {
                compareProvider.add(model);
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

            $scope.nodeTypes = [
                {
                    id: "NAME",
                    title: "Name",
                    tooltip: "Node Name"
                },
                {
                    id: "NN",
                    title: "Number",
                    tooltip: "Number of Node instances"
                },
                {
                    id: "U",
                    title: "Utilization",
                    tooltip: "Total Utilization (U)"
                }
            ];

            $scope.classTypes = [
                {
                    id: "NAME",
                    title: "Name",
                    tooltip: "Class Name"
                },
                {
                    id: "M",
                    title: "Users number",
                    tooltip: "Number of Users (Terminals)(M)"
                },
                {
                    id: "Z",
                    title: "Think Time",
                    tooltip: "Think Time (Z)"
                },
                {
                    id: "X",
                    title: "Throughput",
                    tooltip: "Throughput per Class (X0)"
                },
                {
                    id: "R",
                    title: "Latency",
                    tooltip: "Response Time per Class (R)"
                }
            ];

            $scope.totalVisitTypes = [
                {
                    id: "TV",
                    title: "Visits count",
                    tooltip: "Number of Visits per Request (Vi)"
                },
                {
                    id: "XI",
                    title: "Throughput",
                    tooltip: "Throughput per class (Xi)"
                },
                {
                    id: "S",
                    title: "Service Time",
                    tooltip: "Service Time per class (Si)"
                },
                {
                    id: "D",
                    title: "Demands",
                    tooltip: "Service Demands per class (Di)"
                },
                {
                    id: "U",
                    title: "Utilization",
                    tooltip: "Utilization per class (Ui)"
                },
                {
                    id: "TN",
                    title: "Tasks number",
                    tooltip: "Mean Number of Tasks per class (Ni)"
                },
                {
                    id: "RT",
                    title: "RT",
                    tooltip: "Residence Time per class (RTi)"
                }
            ];
            $scope.visitTypes = [
                {
                    id: "V",
                    title: "Visits number",
                    tooltip: "Number of Visits per Request (Vi)"
                },
                {
                    id: "XI",
                    title: "Throughput",
                    tooltip: "Throughput per class (Xi)"
                },
                {
                    id: "S",
                    title: "Service Time",
                    tooltip: "Service Time per class (Si)"
                },
                {
                    id: "D",
                    title: "Service Demands",
                    tooltip: "Service Demands per class (Di)"
                },
                {
                    id: "U",
                    title: "Utilization",
                    tooltip: "Utilization per class (Ui)"
                },
                {
                    id: "N",
                    title: "Tasks number",
                    tooltip: "Mean Number of Tasks per class (Ni)"
                },
                {
                    id: "RT",
                    title: "Residence Time",
                    tooltip: "Residence Time per class (RTi)"
                }

            ];

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

            $scope.addClass = function () {
                $scope.model.addClass();
                $scope.model.recalculate();
            };

            $scope.refreshCharts = function () {
                $scope.model.refreshCharts();
            };

            $scope.remove = function (center) {
                if (center instanceof QNMNode) {
                    $scope.model.removeNode(center);
                } else if (center instanceof QNMNode) {
                    $scope.model.removeClass(center);
                } else {
                    return;
                }
                $scope.model.recalculate();
            };

            $scope.removeNode = function (node) {
                $scope.model.removeNode(node);
                $scope.model.recalculate();
            };

            $scope.removeClass = function (clazz) {
                $scope.model.removeClass(clazz);
                $scope.model.recalculate();
            };

        })

        .controller('MainMenuCtrl', function ($scope, $timeout, $mdSidenav, $mdUtil, $mdDialog, $log, compareProvider) {

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

            $scope.compare = function (ev) {
                $mdDialog.show({
                    clickOutsideToClose: true,
                    controller: ComparatorController,
                    templateUrl: 'views/compare.dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev
                }).then(
                        function (answer) {
                        },
                        function () {
                        }
                );
            };

            $scope.isNotComparable = function () {
                return compareProvider.models().length < 2;
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
                    targetEvent: ev
                }).then(
                        function (answer) {
                        },
                        function () {
                        }
                );
            };


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

            function ComparatorController($scope, $mdDialog, compareProvider) {


                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.answer = function (answer) {
                    $mdDialog.hide(answer);
                };

                $scope.models = function () {
                    return compareProvider.models();
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




