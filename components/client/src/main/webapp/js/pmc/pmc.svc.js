'use strict';

/* Services */

angular.module('pmc.services', [])

    .service('messageProvider', function ($mdToast, $animate) {

        var toastPosition = {
            bottom: true,
            top: false,
            left: true,
            right: false
        };

        var alerts = [];

        function getToastPosition() {
            return Object.keys(toastPosition)
                .filter(function(pos) { return toastPosition[pos]; })
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
            setAlerts: function (value) {
                alerts = value;
            },
            clear: function () {
                alerts.length = 0;
            },
            close: function (index) {
                alerts.splice(index, 1);
            },
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
                alerts.push({type: 'error', msg: result});
                $mdToast.show({
                    controller: 'ToastCtrl',
                    template:
                    '<md-toast class="md-warn" style="background-color: #e57373">\n' +
                    '<span flex>' + result + '</span>\n' +
                    '<md-button ng-click="closeToast()">\n' +
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
                    template:
                    '<md-toast class="md-warn" style="background-color: #aed581">\n' +
                    '<span flex>' + message + '</span>\n' +
                    '<md-button ng-click="closeToast()">\n' +
                    '<i class="mdi mdi-close"></i>\n' +
                    '</md-button>\n</md-toast>',
                    hideDelay: 6000,
                    position: getToastPosition()
                });
            }
        };
    })

    .service('projectProvider', function ($http, messageProvider, modelFactory) {

        var projects = [];

        var project;

        var url = 'api/projects';

        var remove = function (id) {
            for (var i = 0; i < projects.length; i++) {
                if (projects[i].id === id) {
                    projects.remove(projects[i]);
                    break;
                }
            }
        };
        return {
            getProject: function () {
                return project;
            },
            getProjects: function () {
                return projects;
            },
            findAll: function () {
                messageProvider.clear();
                $http.get(url + '/')
                    .success(function (dto) {
                        projects = dto;
                    })
                    .error(function (data, status) {
                        messageProvider.error(
                            data && data.message ?
                                data.message :
                                "Project List is not loaded.", status);
                    });
            },
            load: function (id) {
                id = id || project.id;
                messageProvider.clear();
                $http.get(url + '/' + id)
                    .success(function (dto) {
                        project.setDTO(dto);
                        messageProvider.info("Project '" + dto.name + "' is loaded.");
                    })
                    .error(function (data, status) {
                        messageProvider.error(
                            data && data.message ?
                                data.message :
                                "Project is not loaded.", status);
                        if (project && project.id) {
                            location.href = "#project/" + project.id;
                        } else {
                            location.href = "#project/new";
                        }
                    });
            },
            new: function () {
                messageProvider.clear();
                project = new Project("New Project", uuid());
                // project.models.push(modelFactory.qnm("QNM " + project.models.length));
                project.models.push(modelFactory.egm("SEM " + project.models.length));
                messageProvider.info("New Project is created.");
                location.href = "#project/" + project.id;
            },
            remove: function (id) {
                id = id || project.id;
                messageProvider.clear();
                $http['delete'](url + '/' + id)
                    .success(function (dto) {
                        messageProvider.info("Project '" + dto.name + "' is deleted.");
                        remove(dto.id);
                        if (project.id === dto.id) {
                            project.new();
                        }
                    })
                    .error(function (data, status) {
                        messageProvider.error(
                            data && data.message ?
                                data.message :
                                "Project is not deleted.", status);
                    });
            },
            save: function () {
                messageProvider.clear();
                var dto = project.createDTO();
                $http.post(url, JSON.stringify(dto))
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
                    });
            },

            addQNM: function () {
                project.models.push(modelFactory.qnm("QNM " + project.models.length));
            },

            addEGM: function () {
                project.models.push(modelFactory.egm("SEM " + project.models.length));
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

    .factory('modelFactory', function() {
    return {
        qnm: function(name) {
            var qnm = new QNM(name || "QNM", uuid());
            qnm.addClass();
            qnm.addNode();
            return  qnm;
        },
        egm: function(name) {
            return  new EGM(name || "SEM", uuid());
        }
    };
});

