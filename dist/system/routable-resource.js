System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var moduleClassStorage, RoutableResource;
    return {
        setters: [],
        execute: function () {
            moduleClassStorage = new Map();
            RoutableResource = class RoutableResource {
                static get moduleClassStorage() {
                    return moduleClassStorage;
                }
                // tslint:disable-next-line:function-name
                static getTarget(moduleId) {
                    return moduleClassStorage.get(moduleId);
                }
                // tslint:disable-next-line:function-name
                static setTarget(moduleId, target) {
                    moduleClassStorage.set(moduleId, target);
                }
            };
            RoutableResource.routableResourceMetadataKey = "aurelia:routable-resource";
            exports_1("RoutableResource", RoutableResource);
        }
    };
});
//# sourceMappingURL=routable-resource.js.map