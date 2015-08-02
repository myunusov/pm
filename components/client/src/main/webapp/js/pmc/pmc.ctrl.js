'use strict';

/* Controllers */

var controllers = angular.module('pmc.controllers', []);

controllers.controller('ProjectCtrl', function ($scope, $mdDialog, $routeParams, projectProvider, compareProvider) {

        $scope.init = function () {
            var id = $routeParams.projectId;
            if (id != null) {
                if (id !== "new") {
                    if (!projectProvider.getProject() || id !== projectProvider.getProject().id) {
                        projectProvider.load(id);
                    }
                } else {
                    projectProvider.make();
                }
            }
        };

        $scope.project = function () {
            return projectProvider.getProject();

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

controllers.controller('MsgCtrl', function ($scope, messageProvider) {

        $scope.alerts = [];
        messageProvider.setAlerts($scope.alerts);

        $scope.closeAlert = function (index) {
            messageProvider.close(index);
        };

    })

controllers.controller('EGMCtrl', function ($scope, messageProvider) {

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

controllers.controller('QNMCtrl', function ($scope, messageProvider) {

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
            },
            {
                id: "TN",
                title: "Number of Tasks",
                tooltip: "Mean Number of Tasks in Queue (N)"
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
                title: "Number of Users",
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
                title: "Response Time",
                tooltip: "Response Time per Class (R)"
            }
        ];

        $scope.totalVisitTypes = [
            {
                id: "TV",
                title: "Visits",
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
                id: "RT",
                title: "Residence Time",
                tooltip: "Residence Time per class (RTi)"
            }
        ];
        $scope.visitTypes = [
            {
                id: "V",
                title: "Visits",
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

        $scope.remove = function (center) {
            if (center instanceof QNMNode) {
                $scope.model.removeNode(center);
            } else if (center instanceof QNMClass) {
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

controllers.controller('MainMenuCtrl', function ($scope,
                                          $timeout,
                                          $mdSidenav,
                                          $mdUtil,
                                          $mdDialog,
                                          $log,
                                          compareProvider,
                                          projectProvider) {

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

        $scope.closeMenu = function () {
            $mdSidenav('left').close()
                .then(function () {
                    $log.debug("close LEFT is done");
                });
        };

        $scope.showComparator = function () {
            location.href = "#compare";
            $mdSidenav('left').close();
        };

        $scope.showProjects = function () {
            location.href = "#projects";
            $mdSidenav('left').close();
        };

        $scope.remove = function () {
            projectProvider.remove();
            $mdSidenav('left').close();
        };

        $scope.make = function () {
            projectProvider.make();
            $mdSidenav('left').close();
        };

        $scope.load = function () {
            projectProvider.load();
            $mdSidenav('left').close();
        };

        $scope.save = function () {
            projectProvider.save();
            $mdSidenav('left').close();
        };

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

        $scope.isNotComparable = function () {
            return compareProvider.models().length < 2;
        };

        $scope.compareModels = function () {
            return compareProvider.models().length;
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

    })

controllers.controller('ComparatorCtrl', function ($scope, $mdDialog, compareProvider) {

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

        $scope.classes = function (index) {
            var models = compareProvider.models();
            var result = [];
            models.each(
                function (m) {
                    m.classes.each(
                        function (c) {
                            result.push(c.name.value);
                        }
                    )
                }
            );
            return result.unique();
        };

        $scope.info = function (model1, model2, cname) {
            var c1, c2;
            model1.classes.each(
                function (c) {
                    if (c.name.value === cname) {
                        c1 = c;
                    }
                });
            model2.classes.each(
                function (c) {
                    if (c.name.value === cname) {

                        c2 = c;
                    }
                });
            if (c1 && c2)
                return new ComparedItem(c1, c2);
            else return new function () {
                this.rAsString = function () {
                    return "X";
                };
                this.xAsString = function () {
                    return "X";
                };
                this.rClass = function () {
                    return "non";
                };
                this.xClass = function () {
                    return "non";
                };
            };
        };


        function ComparedItem(class1, class2) {

            this.r = rSpeedUp(class1, class2);
            this.x = xSpeedUp(class1, class2);

            function rSpeedUp(class1, class2) {
                var time1 = class1.responseTime;
                var time2 = class2.responseTime;
                if (time1.value && time2.value) {
                    return time2.value / time1.value;
                }
                return null;
            }

            function xSpeedUp(class1, class2) {
                var throughput1 = class1.throughput;
                var throughput2 = class2.throughput;
                if (throughput1.value && throughput2.value) {
                    return throughput1.value / throughput2.value;
                }
                return null;
            }

            function boost(speedUp) {
                return speedUp < 1 ? -(1 - speedUp) * 100 : (1 - 1 / speedUp) * 100;
            }

            function formatNumber(value) {
                return Math.round(value) === value ? Math.round(value) : parseFloat(value).toPrecision(3);
            }

            this.rAsString = function () {
                if (!this.r) {
                    return "X";
                }
                return "R:" + formatNumber(this.r) + "  (" + formatNumber(boost(this.r)) + "%)";
            };

            this.xAsString = function () {
                if (!this.x) {
                    return "X";
                }
                return "X:" + formatNumber(this.x) + "  (" + formatNumber(boost(this.x)) + "%)";

            };

            this.rClass = function () {
                if (!this.r || this.r == 1) {
                    return "non";
                }
                return this.r < 1 ? "down" : "up";
            };

            this.xClass = function () {
                if (!this.x || this.x == 1) {
                    return "non";
                }
                return this.x < 1 ? "down" : "up";
            };
        }
    })


controllers.controller('ProjectListCtrl', function ($scope, projectProvider) {

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
            location.href = "#project/" + project.id;
        };

        $scope.remove = function (project) {
            projectProvider.remove(project.id);
        };
    })

controllers.controller('ModalCtrl', function ($scope, projectProvider) {

        $scope.addQNM = function () {
            projectProvider.addQNM();
        };

        $scope.addEGM = function () {
            projectProvider.addEGM();
        };

    })

controllers.controller('ToastCtrl', function($scope, $mdToast) {
        $scope.closeToast = function () {
            $mdToast.hide();
        }
    })

controllers.controller('ChartCtrl', function ($scope, $routeParams, $location, $http, projectProvider) {

        $scope.init = function () {
            var projectId = $routeParams.projectId;
            var modelId = $routeParams.modelId;
            var project = projectProvider.getProject();
            if (!project || project.id !== projectId) {
                // todo load
                return;
            }
            var model = project.getModel(modelId);
            if (model !== null) {
                model.refreshCharts();
            }
        };

    });



