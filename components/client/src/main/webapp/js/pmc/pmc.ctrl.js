'use strict';

/* Controllers */

var controllers = angular.module('pmc.controllers', []);

controllers.controller('ProjectCtrl', function (
        $scope,
        $log,
        $mdDialog,
        modelFactory,
        compareProvider,
        currentProject
) {

    $scope.project = currentProject;

    $scope.newModel = function (ev) {
        $mdDialog.show({
            clickOutsideToClose: true,
            controller: NewModelDialogController,
            templateUrl: 'views/new.dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev
        })
            .then(function (answer) {
                var length = $scope.project.models.length;
                if (answer === "QNM") {
                    $scope.project.models.push(modelFactory.qnm("QNM " + length));
                }
                if (answer === "EGM") {
                    $scope.project.models.push(modelFactory.egm("SEM " + length));
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

    $scope.addToCompare = function (model) {
        compareProvider.add(model);
    };

});

controllers.controller('EGMCtrl', function ($scope) {

    $scope.moveAfter = function(itemId, nodeId) {
        var nodeStepId = nodeId.substring(4);
        var itemStepId = itemId.substring(4);
        if (nodeStepId.indexOf(itemStepId) === 0) {
            return false;
        }
        var node = $scope.model.findById(nodeStepId);
        var item = $scope.model.findById(itemStepId);
        item.moveAfter(node);
        $scope.$apply();
     };

    $scope.moveAtFirst = function(itemId, nodeId) {
        var nodeStepId = nodeId.substring(4);
        var itemStepId = itemId.substring(4);
        if (nodeStepId.indexOf(itemStepId) === 0) {
            return false;
        }
        var node = $scope.model.findById(nodeStepId);
        var item = $scope.model.findById(itemStepId);
        item.moveAtFirst(node);
        $scope.$apply();
    };

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

});

controllers.controller('QNMCtrl', function ($scope, messageService) {

    $scope.nodeTypes = [
        {
            id: "NAME",
            title: "Name",
            type: "text",
            tooltip: "Node Name"
        },
        {
            id: "NN",
            title: "Number",
            type: "number",
            tooltip: "Number of Node instances"
        },
        {
            id: "U",
            title: "Utilization",
            type: "text",
            tooltip: "Total Utilization (U)"
        },
        {
            id: "TN",
            title: "Queue Length",
            type: "text",
            tooltip: "Mean Number of Tasks in Queue (N)"
        }
    ];

    $scope.classTypes = [
        {
            id: "NAME",
            title: "Name",
            type: "text",
            tooltip: "Class Name"
        },
        {
            id: "M",
            title: "Number of Users",
            type: "number",
            tooltip: "Number of Users (Terminals)(M)"
        },
        {
            id: "Z",
            title: "Think Time",
            type: "text",
            tooltip: "Think Time (Z)"
        },
        {
            id: "X",
            title: "Throughput",
            type: "text",
            tooltip: "Throughput per Class (X0)"
        },
        {
            id: "R",
            title: "Response Time",
            type: "text",
            tooltip: "Response Time per Class (R)"
        }
    ];

    $scope.totalVisitTypes = [
        {
            id: "TV",
            title: "Visits",
            type: "number",
            tooltip: "Number of Visits per Request (Vi)"
        },
        {
            id: "XI",
            title: "Throughput",
            type: "text",
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
            type: "text",
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
            type: "text",
            tooltip: "Residence Time per class (RTi)"
        }
    ];
    $scope.visitTypes = [
        {
            id: "V",
            title: "Visits",
            type: "number",
            tooltip: "Number of Visits per Request (Vi)"
        },
        {
            id: "XI",
            title: "Throughput",
            type: "text",
            tooltip: "Throughput per class (Xi)"
        },
        {
            id: "S",
            title: "Service Time",
            type: "text",
            tooltip: "Service Time per class (Si)"
        },
        {
            id: "D",
            title: "Service Demands",
            type: "text",
            tooltip: "Service Demands per class (Di)"
        },
        {
            id: "U",
            title: "Utilization",
            type: "text",
            tooltip: "Utilization per class (Ui)"
        },
        {
            id: "RT",
            title: "Residence Time",
            type: "text",
            tooltip: "Residence Time per class (RTi)"
        }

    ];

    $scope.change = function (fieldName, center) {
        var model = $scope.model;
        model.init();
        var changedField = new Parameter(fieldName, center);
        if (!model.calculate(changedField)) {
            messageService.error("Performance Model is not consistent");
        }
        if (!model.valid()) {
            messageService.error("Performance Model is invalid");
        }
    };

    $scope.addNode = function () {
        $scope.model.addNode();
        $scope.model.cleanCalcFields();
        $scope.model.recalculate();
    };

    $scope.addClass = function () {
        $scope.model.addClass();
        $scope.model.cleanCalcFields();
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
        $scope.model.cleanCalcFields();
        $scope.model.recalculate();
    };

});

controllers.controller('MainMenuCtrl', function ($scope,
                                                 $location,
                                                 $mdSidenav,
                                                 $mdUtil,
                                                 $mdDialog,
                                                 $log,
                                                 compareProvider,
                                                 project,
                                                 projectService) {

    $scope.frameHeight = window.innerHeight;

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

    $scope.make = function () {
        // TODO if current project is not saved ? Save it to local DB with timeout
        var id = uuid();
        project.clone(projectService.make(id));
        $location.path("project/" + id);
        $mdSidenav('left').close();
    };


    $scope.save = function () {
        projectService.save(project.id);
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

});

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
});


controllers.controller('ProjectListCtrl', function (
    $scope,
    $location,
    localProjects,
    remoteProjects,
    project,
    projectService
) {

    $scope.localProjects = localProjects;
    $scope.remoteProjects = remoteProjects;

    var remove = function (projects, id) {
        for (var i = 0; i < projects.length; i++) {
            if (projects[i].id === id) {
                projects.remove(projects[i]);
                break;
            }
        }
    };

    $scope.findRemoteProjects = function () {
        $scope.remoteProjects = projectService.findRemoteProjects();
    };

    $scope.findLocalProjects = function () {
        $scope.localProjects = projectService.findLocalProjects();
    };

    $scope.load = function (prj) {
        projectService.load(prj);
        $location.path("project/" + prj.id);
    };

    $scope.remove = function (prj) {
        // TODO confirmation or undo
        if (!prj.isLocal) {
            projectService.remove(prj.id);
            // TODO on success only
            remove(remoteProjects, prj.id);
        }
        $.jStorage.deleteKey(prj.id);
        remove(localProjects, prj.id);
        // TODO on success only
        if (project.id === prj.id) {
            var id = uuid();
            project.clone(projectService.make(id));
        }
    };
});


controllers.controller('ToastCtrl', function ($scope, $mdToast) {
    $scope.closeToast = function () {
        $mdToast.hide();
    }
});

controllers.controller('ChartCtrl', function ($scope, currentModel) {

    $scope.model = currentModel;

    $scope.refresh = function () {
        if ($scope.model !== null) {
            refreshCharts($scope.model);
        }
    }

    $scope.$watch('$viewContentLoaded', function() {

        if ($scope.model !== null) {
            setTimeout(function() {
                refreshCharts($scope.model);
            }, 100);
        }
    });

    function refreshCharts(model) {
        var builder = new ChartBuilder(model);
        var minRChart = builder.buildMinRChart();
        var maxXChart = builder.buildMaxXChart();

        $(function () {
            $('#rmin').highcharts(minRChart);
            $('#xmax').highcharts(maxXChart);
            $(window).resize();
        });

    };
});



