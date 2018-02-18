"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aurelia_metadata_1 = require("aurelia-metadata");
const aurelia_pal_1 = require("aurelia-pal");
const routable_resource_1 = require("./routable-resource");
const metadataKey = "aurelia:router-metadata";
// tslint:disable-next-line:no-single-line-block-comment
/** @internal */
exports.moduleClassStorage = new Map();
exports.routerMetadata = {
    getOwn(targetOrModuleId) {
        return aurelia_metadata_1.metadata.getOwn(metadataKey, getTarget(targetOrModuleId));
    },
    define(resource, target) {
        aurelia_metadata_1.metadata.define(metadataKey, resource, target);
    },
    getOrCreateOwn(targetOrModuleId) {
        let result = exports.routerMetadata.getOwn(targetOrModuleId);
        if (result === undefined) {
            const target = getTarget(targetOrModuleId);
            const moduleId = getModuleId(targetOrModuleId);
            result = new routable_resource_1.RoutableResource(moduleId, target);
            aurelia_metadata_1.metadata.define(metadataKey, result, target);
        }
        return result;
    },
    getModuleId(target) {
        for (const [key, value] of exports.moduleClassStorage.entries()) {
            if (value === target) {
                return key;
            }
        }
        let moduleId;
        aurelia_pal_1.PLATFORM.eachModule((key, val) => {
            if (typeof val === "object") {
                for (const name of Object.keys(val)) {
                    if (val[name] === target) {
                        moduleId = key;
                        return true;
                    }
                }
            }
            if (val === target) {
                moduleId = key;
                return true;
            }
            return false;
        });
        if (moduleId === undefined) {
            throw new Error(`Module not found for ${target.name}`);
        }
        exports.moduleClassStorage.set(moduleId, target);
        return moduleId;
    },
    getTarget(moduleId) {
        const target = exports.moduleClassStorage.get(moduleId);
        if (target === undefined) {
            throw new Error(`Unable to resolve RoutableResource for ${moduleId}.
        Routes registered through @mapRoutables must have a corresponding @routable on the referenced component.`);
        }
        return target;
    }
};
function getTarget(targetOrModuleId) {
    let target;
    const tag = Object.prototype.toString.call(targetOrModuleId);
    if (tag === "[object String]") {
        target = exports.routerMetadata.getTarget(targetOrModuleId);
    }
    else if (tag === "[object Function]") {
        target = targetOrModuleId;
    }
    else {
        throw new Error(`${targetOrModuleId} is neither a string nor a function`);
    }
    return target;
}
function getModuleId(targetOrModuleId) {
    let moduleId;
    const tag = Object.prototype.toString.call(targetOrModuleId);
    if (tag === "[object String]") {
        moduleId = targetOrModuleId;
    }
    else if (tag === "[object Function]") {
        moduleId = exports.routerMetadata.getModuleId(targetOrModuleId);
    }
    else {
        throw new Error(`${targetOrModuleId} is neither a string nor a function`);
    }
    return moduleId;
}
//# sourceMappingURL=router-metadata.js.map