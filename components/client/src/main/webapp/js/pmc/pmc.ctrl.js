'use strict';

/* Controllers */

var controllers = angular.module('pmc.controllers', []);

controllers.controller('ProjectCtrl', function ($scope,
                                                $log,
                                                $mdDialog,
                                                modelFactory,
                                                presentationModel,
                                                currentProject) {

    $scope.presentationModel = presentationModel;

    $scope.project = currentProject;

    $scope.models = function () {
        return presentationModel.visibleModels;
    };

    $scope.model = function () {
        return presentationModel.currentModel();
    };

    $scope.hideModel = function (model) {
        presentationModel.hide(model);
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
                var model;
                if (answer === "QNM") {
                    model = modelFactory.qnm("QNM " + $scope.project.qnms().length);
                } else if (answer === "EGM") {
                    model = modelFactory.egm("SEM " + $scope.project.sems().length);
                } else {
                    presentationModel.reinit();
                    return;
                }
                $scope.project.addModel(model);
                presentationModel.open(model);

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
        presentationModel.addCompareModel(model);
    };

});

controllers.controller('EGMCtrl', function ($scope) {

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

controllers.controller('QNMCtrl', function ($scope, messageService, presentationModel) {

    $scope.nodeTypes = [
        {
            id: "NAME",
            title: "Name",
            stitle: "Name",
            type: "text",
            tooltip: "Node Name"
        },
        {
            id: "NN",
            title: "No. of Nodes",
            stitle: "No.",
            type: "number",
            tooltip: "Number of Node instances"
        },
        {
            id: "U",
            title: "Utilization",
            stitle: "U",
            type: "text",
            tooltip: "Total Utilization (U)"
        },
        {
            id: "TN",
            title: "Queue Length",
            stitle: "N",
            type: "text",
            tooltip: "Mean Number of Tasks in Queue (N)"
        }
    ];

    $scope.classTypes = [
        {
            id: "NAME",
            title: "Name",
            stitle: "Name",
            type: "text",
            tooltip: "Class Name"
        },
        {
            id: "M",
            title: "No. of Users",
            stitle: "M",
            type: "number",
            tooltip: "Number of Users (Terminals)(M)"
        },
        {
            id: "Z",
            title: "Think Time",
            stitle: "Z",
            type: "text",
            tooltip: "Think Time (Z)"
        },
        {
            id: "X",
            title: "Throughput",
            stitle: "X",
            type: "text",
            tooltip: "Throughput per Class (X0)"
        },
        {
            id: "R",
            title: "Response Time",
            stitle: "R",
            type: "text",
            tooltip: "Response Time per Class (R)"
        }
    ];

    $scope.totalVisitTypes = [
        {
            id: "TV",
            title: "Visits",
            stitle: "V(i)",
            type: "number",
            tooltip: "Number of Visits per Request (Vi)"
        },
        {
            id: "XI",
            title: "Throughput",
            stitle: "X(i)",
            type: "text",
            tooltip: "Throughput per class (Xi)"
        },
        {
            id: "S",
            title: "Service Time",
            stitle: "S(i)",
            tooltip: "Service Time per class (Si)"
        },
        {
            id: "TD",
            title: "Demands",
            stitle: "D(i)",
            type: "text",
            tooltip: "Service Demands per class (Di)"
        },
        {
            id: "U",
            title: "Utilization",
            stitle: "U(i)",
            tooltip: "Utilization per class (Ui)"
        },
        {
            id: "RT",
            title: "Residence Time",
            stitle: "RT(i)",
            type: "text",
            tooltip: "Residence Time per class (RTi)"
        }
    ];
    $scope.visitTypes = [
        {
            id: "V",
            title: "Visits",
            stitle: "V(i)",
            type: "number",
            tooltip: "Number of Visits per Request (Vi)"
        },
        {
            id: "XI",
            title: "Throughput",
            stitle: "X(i)",
            type: "text",
            tooltip: "Throughput per class (Xi)"
        },
        {
            id: "S",
            title: "Service Time",
            stitle: "S(i)",
            type: "text",
            tooltip: "Service Time per class (Si)"
        },
        {
            id: "D",
            title: "Service Demands",
            stitle: "D(i)",
            type: "text",
            tooltip: "Service Demands per class (Di)"
        },
        {
            id: "U",
            title: "Utilization",
            stitle: "U(i)",
            type: "text",
            tooltip: "Utilization per class (Ui)"
        },
        {
            id: "RT",
            title: "Residence Time",
            stitle: "RT(i)",
            type: "text",
            tooltip: "Residence Time per class (RTi)"
        }

    ];

    $scope.modeId = 0;

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

    $scope.isInComparator = function () {
        var models = presentationModel.compareModels;
        for (var i = 0; i < models.length; i++) {
            if (models[i].id === $scope.model.id) {
                return true;
            }
        }
        return false;
    };

    $scope.compare = function () {
        presentationModel.addCompareModel($scope.model);
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
                                                 presentationModel,
                                                 project,
                                                 projectService) {

    $scope.project = project;

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

    $scope.openModel = function (model) {
        presentationModel.open(model);
        $mdSidenav('right').close()
            .then(function () {
                $log.debug("close RIGHT is done");
            });
    };


    $scope.removeModel = function (model) {
        project.removeModel(model);
        presentationModel.hide(model);
        $mdSidenav('right').close()
            .then(function () {
                $log.debug("close RIGHT is done");
            });
    };

    $scope.closeStructure = function () {
        $mdSidenav('right').close()
            .then(function () {
                $log.debug("close RIGHT is done");
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
        return presentationModel.compareModels.length < 2;
    };

    $scope.compareModels = function () {
        return presentationModel.compareModels.length;
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

function ComparableKind(presentationModel) {

    this.abs =  new MXUnit('abs', 'by Absolute values');
    this.unit = this.abs;
    this.units = [this.abs];

    for (var i = 0; i < presentationModel.compareModels.length; i++) {
        var m = presentationModel.compareModels[i];
        this.units.push(new MXUnit(m.id, 'in Relation to ' + m.name));
    }

    this.availableUnits = function () {
        var result = [];
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].id !== this.unit.id) {
                result.push(this.units[i]);
            }
        }
        return result;
    };

    this.createDTO = function () {
        return this.unit.id;
    };

    this.setDTO = function (dto) {
        for (var i = 0; i < this.units.length; i++) {
            if (this.units[i].id === dto) {
                this.unit = this.units[i]
            }
        }
    };

    this.setUnit = function (newValue) {
        this.unit = newValue;
    };
}

controllers.controller('ComparatorCtrl', function ($scope, presentationModel) {

    $scope.kind = new ComparableKind(presentationModel);

    $scope.info = {};

    $scope.setKind = function (kind) {
        $scope.kind.setUnit(kind);
        $scope.info = $scope.resolve();
    };

    $scope.remove = function (model) {
        presentationModel.removeCompareModel(model);
    };

    $scope.models = function () {
        return presentationModel.compareModels;
    };

    $scope.classes = function () {
        var models = presentationModel.compareModels;
        var result = [];
        models.each(
            function (m) {
                m.classes.each(
                    function (c) {
                        result.push(c.title());
                    }
                )
            }
        );
        return result.unique();
    };

    $scope.cell = function (model, clazz) {
        if ($scope.kind.unit.id === "abs") {
            return absolute(clazz);
        } else {
            var baseModel = modelById($scope.kind.unit.id);
            var baseClazz = classByName(baseModel, clazz.title());
            return relative(baseClazz, clazz)
        }
    };

    $scope.resolve = function () {
        $scope.info = {};
        var models = presentationModel.compareModels;
        for (var i = 0; i < models.length; i++) {
            var m = models[i];
            $scope.info[m.id] = {};
            for (var j = 0; j < m.classes.length; j++) {
                var c = m.classes[j];
                var v = {};
                var f = $scope.cell(m, c);
                v["rAsString"] = f.rAsString();
                v["xAsString"] = f.xAsString();
                v["rClass"] = f.rClass();
                v["xClass"] = f.xClass();
                $scope.info[m.id][c.title()] = v;
            }
        }
    };

    $scope.resolve();

    $scope.cells = function (mid, cname) {
        if (!$scope.info || !$scope.info[mid]) {
            $scope.resolve();
        }
        var result = $scope.info[mid][cname];
        return !result ?
        {
            "rAsString": "",
            "xAsString": "",
            "rClass": "non",
            "xClass": "non"
        } :
            result;
    };

    function classByName(model, cname) {
        for (var i = 0; i < model.classes.length; i++) {
            if (model.classes[i].title() === cname) {
                return model.classes[i];
            }
        }
        return null;
    }

    function modelById(id) {
        var models = presentationModel.compareModels;
        for (var i = 0; i < models.length; i++) {
            if (models[i].id === id) {
                return models[i];
            }
        }
        return null;
    }

    function emptyInfo() {
        return new function () {
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
    }

    function absolute(clazz) {
        return new function () {
            this.rAsString = function () {
                return "R:" + clazz.responseTime().asString();
            };
            this.xAsString = function () {
                return "X:" + clazz.throughput().asString();
            };
            this.rClass = function () {
                return "abs";
            };
            this.xClass = function () {
                return "abs";
            };
        };
    }

    function relative(baseClazz, clazz) {
        if (baseClazz)
            return new ComparedItem(baseClazz, clazz);
        else
            return emptyInfo();
    }

    function ComparedItem(class1, class2) {

        this.r = rSpeedUp(class1, class2);
        this.x = xSpeedUp(class1, class2);

        function rSpeedUp(class1, class2) {
            var time1 = class1.responseTime();
            var time2 = class2.responseTime();
            if (time1.value && time2.value) {
                return time2.value / time1.value;
            }
            return null;
        }

        function xSpeedUp(class1, class2) {
            var throughput1 = class1.throughput();
            var throughput2 = class2.throughput();
            if (throughput1.value && throughput2.value) {
                return throughput2.value / throughput1.value;
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
            return this.r < 1 ? "up" : "down";
        };

        this.xClass = function () {
            if (!this.x || this.x == 1) {
                return "non";
            }
            return this.x < 1 ? "down" : "up";
        };
    }
});


controllers.controller('ProjectListCtrl', function ($scope,
                                                    $location,
                                                    localProjects,
                                                    remoteProjects,
                                                    project,
                                                    projectService) {

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

controllers.controller('ChartCtrl', function ($scope) {

    $scope.refresh = function () {
        if ($scope.model !== null) {
            refreshCharts($scope.model);
        }
    };

    $scope.$watch('$viewContentLoaded', function () {

        if ($scope.model !== null) {
            setTimeout(function () {
                refreshCharts($scope.model);
            }, 100);
        }
    });

    function refreshCharts(model) {
        var builder = new ChartBuilder(model);
        var minRChart = builder.buildMinRChart();
        var maxXChart = builder.buildMaxXChart();

        $(function () {
            $('#r' + model.id).highcharts(minRChart);
            $('#x' + model.id).highcharts(maxXChart);
            $(window).resize();
        });

    }
});



