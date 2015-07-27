'use strict';

/* Services */

angular.module('pmc.services', [])

    .service('messageProvider', function ($mdToast, $animate) {

        var toastPosition = {
            bottom: false,
            top: true,
            left: false,
            right: true
        };

        var alerts = [];

        function getToastPosition() {
            return Object.keys(toastPosition)
                .filter(function(pos) { return toastPosition[pos]; })
                .join(' ');
        };

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
                $mdToast.show(
                    $mdToast.simple()
                        .content(result)
                        .position(getToastPosition())
                        .hideDelay(3000)
                );
            },
            info: function (message) {
                alerts.push({type: 'success', msg: message});
                $mdToast.show(
                    $mdToast.simple()
                        .content(message)
                        .position(getToastPosition())
                        .hideDelay(3000)
                );
            }
        };
    })

    .service('projectProvider', function ($http, messageProvider, modelFactory) {

        var projects = [];
        var project = new Project("New Performance Model", uuid());
        project.models.push(modelFactory.qnm("QNM " + project.models.length));
        var url = 'api/projects';

        var remove = function (name) {
            for (var i = 0; i < projects.length; i++) {
                if (projects[i].name === name) {
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
                                "Performance Model List is not loaded.", status);
                    });
            },
            load: function (name) {
                name = name || project.name;
                messageProvider.clear();
                $http.get(url + '/' + name)
                    .success(function (dto) {
                        project.setDTO(dto);
                        messageProvider.info("Performance Model '" + dto.name + "' is loaded.");
                    })
                    .error(function (data, status) {
                        messageProvider.error(
                            data && data.message ?
                                data.message :
                                "Performance Model is not loaded.", status);
                    });
            },
            reset: function () {
                messageProvider.clear();
                project.reset();
                project.models.push(modelFactory.qnm());
            },
            remove: function (name) {
                name = name || project.name;
                messageProvider.clear();
                $http['delete'](url + '/' + name)
                    .success(function (dto) {
                        messageProvider.info("Performance Model '" + dto.name + "' is deleted.");
                        remove(dto.name);
                        if (project.name === dto.name) {
                            project.reset();
                            project.models.push(modelFactory.qnm());
                        }
                    })
                    .error(function (data, status) {
                        messageProvider.error(
                            data && data.message ?
                                data.message :
                                "Performance Model is not deleted.", status);
                    });
            },
            save: function () {
                messageProvider.clear();
                var dto = project.createDTO();
                $http.post(url, JSON.stringify(dto))
                    .success(function (dto, status) {
                        if (status && parseFloat(status) === 201) {
                            project.version = dto.version;
                            remove(dto.name);
                            projects.push({
                                id: dto.id,
                                name: dto.name,
                                version: dto.version
                            });
                            messageProvider.info("Performance Model is saved as '" + dto.name + "'.");
                        } else {
                            messageProvider.error(dto.name, status);
                        }
                    })
                    .error(function (data, status) {
                        messageProvider.error(
                            data && data.message ?
                                data.message :
                                "Performance Model is not saved.", status);
                    });
            },
            addQNM: function () {
                project.models.push(modelFactory.qnm("QNM " + project.models.length));
            },

            addEGM: function () {
                project.models.push(modelFactory.egm("EGM " + project.models.length));
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
            return  new EGM(name || "EGM", uuid());
        }
    };
});

