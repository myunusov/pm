/*
 * Copyright (c) 2013 Maxim Yunusov
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

describe('pm', function() {

    var module;

    beforeEach(function() {
        module = angular.module("pm");
    });

    it("should be registered", function() {
        expect(module).not.toEqual(null);
    });

    describe("Dependencies:", function() {

        var deps;

        var hasModule = function(m) {
            return deps.indexOf(m) >= 0;
        };

        beforeEach(function() {
            deps = module.value('QNMCtrl').requires;
        });

        it("should have pm.service as a dependency", function() {
            expect(hasModule('pm.service')).toEqual(true);
        });

        it("should have pm.directive as a dependency", function() {
            expect(hasModule('pm.directive')).toEqual(true);
        });

        it("should have pm.filter as a dependency", function() {
            expect(hasModule('pm.filter')).toEqual(true);
        });
    });



});