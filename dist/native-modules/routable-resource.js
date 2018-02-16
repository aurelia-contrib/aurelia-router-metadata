const moduleClassStorage = new Map();
export class RoutableResource {
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
//# sourceMappingURL=routable-resource.js.map