define(["require", "exports", "aurelia-metadata", "./router-resource"], function (require, exports, aurelia_metadata_1, router_resource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const metadataKey = "aurelia:router-metadata";
    exports.routerMetadata = {
        getOwn(target) {
            return aurelia_metadata_1.metadata.getOwn(metadataKey, target);
        },
        define(resource, target) {
            aurelia_metadata_1.metadata.define(metadataKey, resource, target);
        },
        getOrCreateOwn(target, moduleId) {
            let result = exports.routerMetadata.getOwn(target);
            if (result === undefined) {
                result = new router_resource_1.RouterResource(target, moduleId);
                aurelia_metadata_1.metadata.define(metadataKey, result, target);
            }
            return result;
        }
    };
});
