'use strict';

function DropDownController() {

    this.item = null;

    this.dragStart = function(dragElement) {
        this.item = dragElement;
    };

    this.dragEnd = function() {
        this.item = null;
    };
}
var dropDownController = new  DropDownController();


/* Directives */

angular.module('pmc.directives', [])

        .directive('mxTree', function () {

            return {
                restrict: 'E',
                replace: true,
                controller: DropDownController,
                scope: {
                    steps: '=',
                    node:  '='
                },
                template: '<ul><mx-tree-node ng-repeat="step in steps" step="step"></mx-tree-node></ul>',


                link: function (scope, element) {
                    var el = element[0];
                    el.addEventListener(
                            'dragover',
                            function (e) {
                                if (typeof scope.node.dragOver == 'function') {
                                    if (!scope.node.dragOver(dropDownController.item)) {
                                        return false;
                                    }
                                }
                                // allows us to drop
                                e.dataTransfer.dropEffect = 'move';
                                if (e.preventDefault)
                                    e.preventDefault();
                                event.target.style.opacity = .5;
                                this.classList.add('over');
                                return false;
                            },
                            false
                    );
                    el.addEventListener(
                            'dragenter',
                            function (e) {
                                this.classList.add('over');
                                event.target.style.opacity = .5;
                                return false;
                            },
                            false
                    );

                    el.addEventListener(
                            'dragleave',
                            function (e) {
                                this.classList.remove('over');
                                event.target.style.opacity = 1;
                                return false;
                            },
                            false
                    );
                    el.addEventListener(
                            'drop',
                            function (e) {
                                // Stops some browsers from redirecting.
                                if (e.stopPropagation)
                                    e.stopPropagation();
                                this.classList.remove('over');
                                event.target.style.opacity = 1;
                                var item = document.getElementById(e.dataTransfer.getData('Text'));
                                var fn = scope.drop({itemId: item.id, nodeId: el.id});
                            },
                            false
                    );
                }
            };
        })

        .directive('mxTreeNode', function ($compile) {

            return {
                restrict: 'E',
                replace: true,
                controller: DropDownController,
                scope: {
                    step: '='
                },
                link: function (scope, element, attrs, controller) {

                    var el = element[0];

                    el.draggable = true;

                    if (angular.isArray(scope.step.steps)) {
                        element.append("<mx-tree steps='step.steps' node='step'></mx-tree>");
                        $compile(element.contents())(scope)
                    }

                    el.addEventListener(
                            'dragstart',
                            function (e) {
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('Text', this.id);
                                this.classList.add('drag');
                                dropDownController.dragStart(scope.step);
                                if (typeof scope.step.dragStart == 'function') {
                                    scope.step.dragStart();
                                }
                                return false;
                            },
                            false
                    );

                    el.addEventListener(
                            'dragend',
                            function (e) {
                                this.classList.remove('drag');
                                dropDownController.dragEnd(scope.step);
                                if (typeof scope.step.dragEnd == 'function') {
                                    scope.step.dragEnd();
                                }
                                return false;
                            },
                            false
                    );
                },
                template: '<li class="tree-li parent-li""> <div ng-include="step.url"></div></li>'
            };
        })

        .directive('draggable', function () {
            return function (scope, element) {
                // this gives us the native JS object
                var el = element[0];

                el.draggable = true;

                el.addEventListener(
                        'dragstart',
                        function (e) {
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('Text', this.id);
                            this.classList.add('drag');
                            return false;
                        },
                        false
                );

                el.addEventListener(
                        'dragend',
                        function (e) {
                            this.classList.remove('drag');
                            return false;
                        },
                        false
                );
            };
        })

        .directive('droppable', function () {
            return {
                scope: {
                    drop: '&' // parent
                },
                link: function (scope, element) {
                    // again we need the native object
                    var el = element[0];
                    el.addEventListener(
                            'dragover',
                            function (e) {
                                // allows us to drop
                                e.dataTransfer.dropEffect = 'move';
                                if (e.preventDefault)
                                    e.preventDefault();
                                event.target.style.opacity = .5;
                                this.classList.add('over');
                                return false;
                            },
                            false
                    );
                    el.addEventListener(
                            'dragenter',
                            function (e) {
                                this.classList.add('over');
                                event.target.style.opacity = .5;
                                return false;
                            },
                            false
                    );

                    el.addEventListener(
                            'dragleave',
                            function (e) {
                                this.classList.remove('over');
                                event.target.style.opacity = 1;
                                return false;
                            },
                            false
                    );
                    el.addEventListener(
                            'drop',
                            function (e) {
                                // Stops some browsers from redirecting.
                                if (e.stopPropagation)
                                    e.stopPropagation();
                                this.classList.remove('over');
                                event.target.style.opacity = 1;
                                var item = document.getElementById(e.dataTransfer.getData('Text'));
                                var fn = scope.drop({itemId: item.id, nodeId: this.id});
                            },
                            false
                    );
                }
            }
        })

        .directive('resize', function ($window) {
            return function (scope, element) {
                var w = angular.element($window);
                scope.getWindowDimensions = function () {
                    return {
                        'h': w.height(),
                        'w': w.width()
                    };
                };
                scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                    scope.windowHeight = newValue.h;
                    scope.windowWidth = newValue.w;

                    scope.height = function () {
                        return {
                            'height': (newValue.h) + 'px'
                        };
                    };
                    scope.width = function () {
                        return {
                            'width': (newValue.w) + 'px'
                        };
                    };

                }, true);
                w.bind('resize', function () {
                    scope.$apply();
                });
            };
        })

        .directive('includeReplace', function () {
            return {
                require: 'ngInclude',
                restrict: 'A', /* optional */
                link: function (scope, el, attrs) {
                    el.replaceWith(el.children());
                }
            };
        })

        .directive('onCollapse', function () {
            return function (scope, element, attrs) {
                $(element).find(' > i').not(".icon-leaf").on('click', clickingCallback);
            }
        });


function clickingCallback(e) {
    var children = $(this).closest('li.parent-li').find(' > ul > li');
    if (children.is(":visible")) {
        children.hide('fast');
        if ($(this).hasClass("icon-minus-sign")) {
            $(this).addClass('icon-plus-sign').removeClass('icon-minus-sign');
        }
        if ($(this).hasClass("icon-folder-open")) {
            $(this).addClass('icon-folder-close').removeClass('icon-folder-open');
        }
    } else {
        children.show('fast');
        if ($(this).hasClass("icon-plus-sign")) {
            $(this).addClass('icon-minus-sign').removeClass('icon-plus-sign');
        }
        if ($(this).hasClass("icon-folder-close")) {
            $(this).addClass('icon-folder-open').removeClass('icon-folder-close');
        }
    }
    e.stopPropagation();
}