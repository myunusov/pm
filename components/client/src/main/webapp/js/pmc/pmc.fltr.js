'use strict';

/* Filters */

angular.module('pmc.filters', [])

    .filter('qnmWithout', function () {
        return function (input, model) {
            var out = [];
            for (var i = 0; i < input.length; i++) {
                if (input[i].type === "qnm" && input[i] !== model)
                    out.push(input[i]);
            }
            return out;
        };
    });