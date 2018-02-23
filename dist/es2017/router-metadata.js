import { metadata } from "aurelia-metadata";
import { RouterResource } from "./router-resource";
const metadataKey = "aurelia:router-metadata";
export const routerMetadata = {
    getOwn(target) {
        return metadata.getOwn(metadataKey, target);
    },
    define(resource, target) {
        metadata.define(metadataKey, resource, target);
    },
    getOrCreateOwn(target, moduleId) {
        let result = routerMetadata.getOwn(target);
        if (result === undefined) {
            result = new RouterResource(target, moduleId);
            metadata.define(metadataKey, result, target);
        }
        return result;
    }
};
