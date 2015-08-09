'use strict';

/* Services */

angular.module('pmc.services', [])

    .service('messageService', function ($mdToast, $animate) {

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
                var result = "Error!";
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
                alerts.push({type: 'success', msg: message});
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
            // TODO result must be retuned sync. May be $resources ?

            // TODO Fix
            findAll: function () {
                return ProjectDto.query(function () {
                    // TODO error handler
                    //projects = dto;
                });


/*                $http.get(url + '/')
                    .success(function (dto) {
                        projects = dto;
                    })
                    .error(function (data, status) {
                        messageProvider.error(
                            data && data.message ?
                                data.message :
                                "Project List is not loaded.", status);
                    });*/
            },

            make: function (id) {
                id = id || uuid();
                var result = new Project("New Project", id);
                // project.models.push(modelFactory.qnm("QNM " + project.models.length));
                result.models.push(modelFactory.egm("SEM 0"));
                messageService.info("New Project is created.");
                return result;
            },
            load: function (id) {
                var dto = ProjectDto.get({projectId: id}, function () {
                    // TODO error handler
                    project.setDTO(dto);
                    messageService.info("Project '" + dto.name + "' is loaded.");
                });
                return project;


                /*                id = id || project.id;
                 messageProvider.clear();
                 $http.get(url + '/' + id)
                 .success(function (dto) {
                 project.setDTO(dto);
                 success(project);
                 messageProvider.info("Project '" + dto.name + "' is loaded.");
                 })
                 .error(function (data, status) {
                 messageProvider.error(
                 data && data.message ?
                 data.message :
                 "Project is not loaded.", status);
                 error(id);
                 });*/
            },
            remove: function (id) {
                ProjectDto.remove({projectId: id}, function () {
                    // TODO error handler
                    messageService.info("Project is deleted.");
                });
                /*                id = id || project.id;
                 messageProvider.clear();
                 $http['delete'](url + '/' + id)
                 .success(function (dto) {
                 messageProvider.info("Project '" + dto.name + "' is deleted.");
                 remove(dto.id);
                 if (project.id === dto.id) {
                 this.make();
                 }
                 })
                 .error(function (data, status) {
                 messageProvider.error(
                 data && data.message ?
                 data.message :
                 "Project is not deleted.", status);
                 });*/
            },
            save: function () {
                var dto = project.createDTO(new ProjectDto());
                dto.$save(
                    // TODO error handler
                    function (dto, putResponseHeaders) {
                        messageService.info("Project is saved as '" + dto.name + "'.");
                    }
                );
                /*                $http.post(url, JSON.stringify(dto))
                 .success(function (dto, status) {
                 if (status && parseFloat(status) === 201) {
                 project.version = dto.version;
                 remove(dto.id);
                 projects.push({
                 id: dto.id,
                 name: dto.name,
                 version: dto.version
                 });
                 messageProvider.info("Project is saved as '" + dto.name + "'.");
                 } else {
                 messageProvider.error(dto.name, status);
                 }
                 })
                 .error(function (data, status) {
                 messageProvider.error(
                 data && data.message ?
                 data.message :
                 "Project is not saved.", status);
                 });*/
            },

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

