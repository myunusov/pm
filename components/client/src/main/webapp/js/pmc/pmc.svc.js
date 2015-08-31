'use strict';

/* Services */

angular.module('pmc.services', [])

    .service('messageService', function ($mdToast) {
        var toastPosition = {
            bottom: true,
            top: false,
            left: true,
            right: false
        };

        function getToastPosition() {
            return Object.keys(toastPosition)
                .filter(function (pos) {
                    return toastPosition[pos];
                })
                .join(' ');
        }

        function getMessageBy(errorcode) {
            switch (parseFloat(errorcode)) {
                case 400:
                    return "The request could not be understood by the server due to malformed syntax.";
                case 403:
                    return "The server is refusing to respond to request.";
                case 404:
                    return "The requested resource could not be found.";
                case 409:
                    return "The request could not be completed due to a conflict with the current state.";
                default :
                    return "Unknown error with code " + errorcode;
            }
        }

        return {
            error: function (message, errorcode) {
                var result = "";
                if (message instanceof Array) {
                    for (var i = 0; i < message.length; i++) {
                        result += " " + message[i];
                    }
                } else {
                    result += " " + message;
                }
                if (errorcode) {
                    result += " " + getMessageBy(errorcode);
                }
                $mdToast.show({
                    controller: 'ToastCtrl',
                    template: '<md-toast class="md-warn" style="background-color: #e57373">\n' +
                    '<span flex>' + result + '</span>\n' +
                    '<md-button aria-label="Close Toast" ng-click="closeToast()">\n' +
                    '<i class="mdi mdi-close"></i>\n' +
                    '</md-button>\n</md-toast>',
                    hideDelay: 6000,
                    position: getToastPosition()
                });
            },
            info: function (message) {
                $mdToast.show({
                    controller: 'ToastCtrl',
                    template: '<md-toast class="md-warn" style="background-color: #aed581">\n' +
                    '<span flex>' + message + '</span>\n' +
                    '<md-button aria-label="Close Toast" ng-click="closeToast()">\n' +
                    '<i class="mdi mdi-close"></i>\n' +
                    '</md-button>\n</md-toast>',
                    hideDelay: 6000,
                    position: getToastPosition()
                });
            }
        };
    })

    .provider('project', function () {
        var project = new Project();
        this.$get = function () {
            return project;
        }
    })

    .service('projectService', function ($resource, project, messageService, modelFactory) {

        var ProjectDto = $resource('/api/project/:projectId', {projectId: '@id'});

        function saveTempBak() {
            if (project && project.id) {
                var dto = project.createDTO(new ProjectDto());
                $.jStorage.set(project.id, dto);
                $.jStorage.setTTL(project.id, 1800000);
            }
        }

        function saveAsCurrent(currentProject) {
            if (currentProject && currentProject.id) {
                var dto = currentProject.createDTO(new ProjectDto());
                $.jStorage.set(currentProject.id, dto);
                $.jStorage.setTTL(currentProject.id, 1800000);
            }
        }

        return {

            findLocalProjects: function () {
                var result = [];
                var index = $.jStorage.index();
                for (var i = 0; i < index.length; i++) {
                    var item = $.jStorage.get(index[i]);
                    item.isLocal = true;
                    result.push(item);
                }
                return result;
            },

            findRemoteProjects: function () {
                return ProjectDto.query(function (data) {
                    for (var j = 0; j < data.length; j++) {
                        data[j].isLocal = false;
                    }
                }, function (error) {
                    var text = error.statusText ? ". " + error.statusText + ". " : "";
                    messageService.error("Project Repository is not accessible." + text, error.status);
                });
            },

            make: function (id) {
                saveTempBak();
                id = id || uuid();
                var result = new Project("New Project", id);
                result.addModel(modelFactory.qnm("QNM 0"));
                result.addModel(modelFactory.egm("SEM 0"));
                saveAsCurrent(result);
                messageService.info("New Project is created.");
                return result;
            },
            findBy: function (id) {
                if (project && project.id === id) {
                    return project;
                }
                saveTempBak();
                var dto = $.jStorage.get(id);
                if (dto) {
                    project.setDTO(dto);
                    return project;
                }
                dto = ProjectDto.get({projectId: id}, function () {
                    project.setDTO(dto);
                    messageService.info("Project '" + dto.name + "' is loaded.");
                    $.jStorage.set(project.id, dto);
                }, function (error) {
                    var text = error.statusText ? ". " + error.statusText + ". " : "";
                    messageService.error("Project is not loaded." + text, error.status);
                });
                saveAsCurrent(project);
                return project;
            },
            load: function (prj) {
                if (project && project.id !== prj.id) {
                    saveTempBak();
                }
                var dto;
                if (prj.islocal) {
                    dto = $.jStorage.get(prj.id);
                    project.setDTO(dto);
                } else {
                    dto = ProjectDto.get({projectId: prj.id}, function () {
                        project.setDTO(dto);
                        messageService.info("Project '" + dto.name + "' is loaded.");
                        $.jStorage.set(project.id, dto);
                    }, function (error) {
                        var text = error.statusText ? ". " + error.statusText + ". " : "";
                        messageService.error("Project is not loaded." + text, error.status);
                    });
                }
                saveAsCurrent(project);
                return project;
            },
            remove: function (id) {
                ProjectDto.remove({projectId: id}, function () {
                    $.jStorage.deleteKey(id);
                    messageService.info("Project is deleted.");
                }, function (error) {
                    var text = error.statusText ? ". " + error.statusText + ". " : "";
                    messageService.error("Project is not deleted." + text, error.status);
                });
            },
            save: function () {
                var dto = project.createDTO(new ProjectDto());
                $.jStorage.set(project.id, dto);
                // Todo is changed ?
                dto.$save(function (dto) {
                    messageService.info("Project is saved as '" + dto.name + "'.");
                    project.version = dto.version;
                }, function (error) {
                    var text = error.statusText ? ". " + error.statusText + ". " : "";
                    messageService.error("Project is not saved." + text, error.status);
                });
            }
        };
    })

    .service('compareProvider', function () {

        var models = [];
        return {
            models: function () {
                return models;
            },
            add: function (model) {
                models.push(model);
                models = models.unique();
            },
            remove: function (model) {
                models.remove(model);
            }
        }
    })

    .factory('modelFactory', function () {
        return {
            qnm: function (name) {
                var qnm = new QNM(name || "QNM", uuid());
                qnm.addClass();
                qnm.addNode();
                return qnm;
            },
            egm: function (name) {
                var egm = new EGM(name || "SEM", uuid());
                egm.addResource();
                egm.addScenario();
                return egm;
            }
        };
    });

