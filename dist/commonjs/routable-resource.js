"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moduleClassStorage = new Map();
class RoutableResource {
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
}
RoutableResource.routableResourceMetadataKey = "aurelia:routable-resource";
exports.RoutableResource = RoutableResource;
//# sourceMappingURL=routable-resource.js.map