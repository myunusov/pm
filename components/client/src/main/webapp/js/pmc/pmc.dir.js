'use strict';

/* Directives */

angular.module('pmc.directives', [])

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
                    drop: '&', // parent
                    node: '=' // bi-directional scope
                },
                link: function (scope, element) {
                    // again we need the native object
                    var el = element[0];
                    el.addEventListener(
                            'dragover',
                            function(e) {
                                e.dataTransfer.dropEffect = 'move';
                                // allows us to drop
                                if (e.preventDefault) e.preventDefault();
                                this.classList.add('over');
                                return false;
                            },
                            false
                    );
                    el.addEventListener(
                            'dragenter',
                            function(e) {
                                this.classList.add('over');
                                return false;
                            },
                            false
                    );

                    el.addEventListener(
                            'dragleave',
                            function(e) {
                                this.classList.remove('over');
                                return false;
                            },
                            false
                    );
                    el.addEventListener(
                            'drop',
                            function(e) {
                                // Stops some browsers from redirecting.
                                if (e.stopPropagation) e.stopPropagation();

                                this.classList.remove('over');
                                var nodeId = this.id;
                                var item = document.getElementById(e.dataTransfer.getData('Text'));
                                var fn = scope.drop();
                                if ('undefined' !== typeof fn) {
                                    fn(item.id, nodeId);
                                }
                                return false;
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