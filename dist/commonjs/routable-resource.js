"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moduleClassStorage = new Map();
var RoutableResource = (function () {
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
exports.RoutableResource = RoutableResource;
//# sourceMappingURL=routable-resource.js.map