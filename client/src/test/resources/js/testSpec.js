describe("Midway: Testing Modules", function() {

    describe("Performance Model App Module:", function() {

        var module;

        beforeEach(function() {
            module = angular.module("perfModelApp");
        });

        it("should be registered", function() {
            expect(module).not.toEqual(null);
        });

/*        describe("Dependencies:", function() {

            var deps;
            var hasModule = function(m) {
                return deps.indexOf(m) >= 0;
            };
            beforeEach(function() {
                deps = module.value('MainCtrl').requires;
            });

            //you can also test the module's dependencies
            it("should have App.Controllers as a dependency", function() {
                expect(hasModule('App.Controllers')).toEqual(true);
            });
        });


        describe("Model Initialization:", function() {

            it("should be initialized", function() {
                expect($scope.model).not.toEqual(null);
            });


        });*/
    });
});