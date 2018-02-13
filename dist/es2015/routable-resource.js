const moduleClassStorage = new Map();
export class RoutableResource {
    static getTarget(moduleId) {
        return moduleClassStorage.get(moduleId);
    }
    static setTarget(moduleId, target) {
        moduleClassStorage.set(moduleId, target);
    }
}
RoutableResource.routableResourceMetadataKey = "aurelia:routable-resource";
//# sourceMappingURL=routable-resource.js.map