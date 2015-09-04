describe('PMC Application', function() {

    var module;

    beforeEach(function() {
        module = angular.module("pmc");
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
            deps = module.value('QNMCtrl').requires.concat(deps);
        });

        it("should have pmc.services as a dependency", function() {
            expect(hasModule('pmc.services')).toEqual(true);
        });

        it("should have pmc.directives as a dependency", function() {
            expect(hasModule('pmc.directives')).toEqual(true);
        });

        it("should have pmc.controllers as a dependency", function() {
            expect(hasModule('pmc.controllers')).toEqual(true);
        });

        it("should have pmc.filters as a dependency", function() {
            expect(hasModule('pmc.filters')).toEqual(true);
        });
    });



});