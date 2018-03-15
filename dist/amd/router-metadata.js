define(["require", "exports", "@src/router-resource"], function (require, exports, router_resource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const key = "__routerMetadata__";
    const resourceKey = "resource";
    exports.routerMetadata = {
        getOwn(target) {
            const metadata = getMetadataObject(target);
            return metadata[resourceKey];
        },
        define(resource, target) {
            const metadata = getMetadataObject(target);
            Object.defineProperty(metadata, resourceKey, {
                enumerable: false,
                configurable: false,
                writable: true,
                value: resource
            });
        },
        getOrCreateOwn(target, moduleId) {
            const metadata = getMetadataObject(target);
            let result = metadata[resourceKey];
            if (result === undefined) {
                result = metadata[resourceKey] = new router_resource_1.RouterResource(target instanceof Function ? target : target.constructor, moduleId);
            }
            return result;
        }
    };
    function getMetadataObject(target) {
        const proto = target instanceof Function ? target.prototype : target;
        if (!Object.prototype.hasOwnProperty.call(proto, key)) {
            Object.defineProperty(proto, key, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: Object.create(null)
            });
        }
        return proto[key];
    }
});
