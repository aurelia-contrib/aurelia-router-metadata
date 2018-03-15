import { RouterResource } from "@src/router-resource";
const key = "__routerMetadata__";
const resourceKey = "resource";
export const routerMetadata = {
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
            result = metadata[resourceKey] = new RouterResource(target instanceof Function ? target : target.constructor, moduleId);
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
