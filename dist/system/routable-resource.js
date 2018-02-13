System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var moduleClassStorage, RoutableResource;
    return {
        setters: [],
        execute: function () {
            moduleClassStorage = new Map();
            RoutableResource = (function () {
                function RoutableResource() {
                }
                RoutableResource.getTarget = function (moduleId) {
                    return moduleClassStorage.get(moduleId);
                };
                RoutableResource.setTarget = function (moduleId, target) {
                    moduleClassStorage.set(moduleId, target);
                };
                RoutableResource.routableResourceMetadataKey = "aurelia:routable-resource";
                return RoutableResource;
            }());
            exports_1("RoutableResource", RoutableResource);
        }
    };
});
//# sourceMappingURL=routable-resource.js.map