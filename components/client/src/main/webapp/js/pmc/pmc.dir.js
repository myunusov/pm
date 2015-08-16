'use strict';

/* Directives */

angular.module('pmc.directives', [])

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
    })


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