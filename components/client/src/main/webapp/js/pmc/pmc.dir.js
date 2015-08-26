'use strict';

/* Directives */

var dirs = angular.module('pmc.directives', []);

dirs.controller('MxTreeCtrl', function ($scope) {

    this.item = null;

    this.dragStart = function (dragElement) {
        this.item = dragElement;
    };

    this.dragEnd = function () {
        this.item = null;
    };

});

dirs.directive('mxTree', function () {
    return {
        restrict: 'E',
        controller: 'MxTreeCtrl',
        scope: {
            step: '='
        },
        transclude: true,
        link: function(scope, element, attrs, ctrl, transclude) {
            transclude(scope, function(clone) {
                $(clone[1]).html();
            });
        },
        template: "<mx-branch step='step'></mx-branch>"
    }
});

dirs.directive('mxBranch', function () {

    return {
        restrict: 'E',
        replace: true,
        require: '^mxTree',
        scope: {
            step: '='
        },
        template: '<ul><mx-tree-node ng-repeat="step in step.steps" step="step"></mx-tree-node></ul>'
    };
});

dirs.directive('mxTreeNode', function ($compile) {

    return {
        restrict: 'E',
        replace: true,
        require: '^mxTree',
        scope: {
            step: '='
        },
        link: function (scope, element) {
            if (angular.isArray(scope.step.steps)) {
                element.append("<mx-branch step='step'></mx-branch>");
                $compile(element.contents())(scope)
            }

        },
        template: '<li class="tree-li parent-li"><mx-tree-node-content step="step"></mx-tree-node-content></li>'
    };
});

dirs.directive('mxTreeNodeContent', function () {

    function cleanDragClasses(item) {
        item.classList.remove('over-top');
        item.classList.remove('over-middle');
        item.classList.remove('over-bottom');
    }

    function calcDragPos(element, event) {
        var rect = element.getBoundingClientRect();
        var offsetY = event.clientY - rect.top;
        return Math.floor(offsetY / ($(element).height() / 3));
    }

    return {
        restrict: 'E',
        replace: true,
        require: '^mxTree',
        scope: {
            step: '='
        },
        link: function (scope, element, attrs, rootCtrl) {
            var el = element[0];
            el.draggable = true;
            el.addEventListener(
                    'dragstart',
                    function (e) {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('Text', this.id);
                        this.classList.add('drag');
                        rootCtrl.dragStart(scope.step);
                        if (typeof scope.step.dragStart == 'function') {
                            scope.step.dragStart();
                        }
                        e.stopPropagation();
                        return false;
                    },
                    false
            );

            el.addEventListener(
                    'dragend',
                    function (e) {
                        this.classList.remove('drag');
                        rootCtrl.dragEnd(scope.step);
                        if (typeof scope.step.dragEnd == 'function') {
                            scope.step.dragEnd();
                        }
                        e.stopPropagation();
                        return false;
                    },
                    false
            );

            el.addEventListener(
                    'dragover',
                    function (e) {
                        e.stopPropagation();
                        var pos = calcDragPos(el, e);
                        if (pos < 0) {
                            return false;
                        }

                        if (typeof scope.step.dragOver == 'function') {
                            if (!scope.step.dragOver(rootCtrl.item)) {
                                return false;
                            }
                        }
                        // allows us to drop
                        e.dataTransfer.dropEffect = 'move';
                        if (e.preventDefault)
                            e.preventDefault();
                        cleanDragClasses(this);
                        switch (pos) {
                            case 2:
                                this.classList.add('over-bottom');
                                break;
                            case 1:
                                this.classList.add('over-middle');
                                break;
                            default:
                                this.classList.add('over-top');
                                break;
                        }
                        return false;
                    },
                    false
            );
            el.addEventListener(
                    'dragenter',
                    function (e) {
                        return false;
                    },
                    false
            );

            el.addEventListener(
                    'dragleave',
                    function (e) {
                        cleanDragClasses(this);
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
                        cleanDragClasses(this);
                        var Y = event.layerY - $(event.target).position().top;
                        var pos = Math.floor(Y / ($(event.target).height() / 3));
                        switch (pos) {
                            case 2:
                                if (typeof scope.step.dropAfter == 'function') {
                                    scope.step.dropAfter(rootCtrl.item);
                                    scope.$apply();
                                }
                                break;
                            case 1:
                                if (typeof scope.step.dropIn == 'function') {
                                    scope.step.dropIn(rootCtrl.item);
                                    scope.$apply();
                                }
                                break;
                            default:
                                if (typeof scope.step.dropBefore == 'function') {
                                    scope.step.dropBefore(rootCtrl.item);
                                    scope.$apply();
                                }
                                break;
                        }


                    },
                    false
            );
        },
        template: '<div><div ng-include="step.url"></div></div>'
    }


});

dirs.directive('draggable', function () {
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
});

dirs.directive('droppable', function () {
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
});

dirs.directive('resize', function ($window) {
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
                    'height': (newValue.h - 20) + 'px'
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
});

dirs.directive('includeReplace', function () {
    return {
        require: 'ngInclude',
        restrict: 'A', /* optional */
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
});

dirs.directive('onCollapse', function () {
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