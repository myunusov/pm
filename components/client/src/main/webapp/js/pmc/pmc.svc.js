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

            return {
                findAll: function () {

                    var localProjects = [];
                    var index = $.jStorage.index();
                    for (var i = 0; i < index.length; i++) {
                        var item = $.jStorage.get(index[i]);
                        item.isLocal = true;
                        localProjects.push(item);
                    }

                    var projects = ProjectDto.query(function (data) {
                    }, function (error) {
                        var text = error.statusText ? ". " + error.statusText + ". " : "";
                        messageService.error("Project Repository is not accessible." + text, error.status);
                    });
                    for (var j = 0; j < projects.length; j++) {
                        projects[i].isLocal = false;
                    }
                    projects.concat(localProjects);                    
                    return projects;
                },

                make: function (id) {
                    id = id || uuid();
                    var result = new Project("New Project", id);
                    // result.models.push(modelFactory.qnm("QNM 0"));
                    result.models.push(modelFactory.egm("SEM 0"));
                    messageService.info("New Project is created.");
                    return result;
                },
                load: function (id) {
                    var dto = ProjectDto.get({projectId: id}, function () {
                        project.setDTO(dto);
                        messageService.info("Project '" + dto.name + "' is loaded.");
                    }, function (error) {
                        var text = error.statusText ? ". " + error.statusText + ". " : "";
                        messageService.error("Project is not loaded." + text, error.status);
                    });
                    return project;
                },
                remove: function (id) {
                    ProjectDto.remove({projectId: id}, function () {
                        messageService.info("Project is deleted.");
                    }, function (error) {
                        var text = error.statusText ? ". " + error.statusText + ". " : "";
                        messageService.error("Project is not deleted." + text, error.status);
                    });
                },
                save: function () {
                    var dto = project.createDTO(new ProjectDto());
                    $.jStorage.set(project.id, dto);
                    dto.$save(function (dto) {
                        messageService.info("Project is saved as '" + dto.name + "'.");
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

