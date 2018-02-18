import { metadata } from "aurelia-metadata";
import { PLATFORM } from "aurelia-pal";
import { RoutableResource } from "./routable-resource";
const metadataKey = "aurelia:router-metadata";
// tslint:disable-next-line:no-single-line-block-comment
/** @internal */
export const moduleClassStorage = new Map();
export const routerMetadata = {
    getOwn(targetOrModuleId) {
        return metadata.getOwn(metadataKey, getTarget(targetOrModuleId));
    },
    define(resource, target) {
        metadata.define(metadataKey, resource, target);
    },
    getOrCreateOwn(targetOrModuleId) {
        let result = routerMetadata.getOwn(targetOrModuleId);
        if (result === undefined) {
            const target = getTarget(targetOrModuleId);
            const moduleId = getModuleId(targetOrModuleId);
            result = new RoutableResource(moduleId, target);
            metadata.define(metadataKey, result, target);
        }
        return result;
    },
    getModuleId(target) {
        for (const [key, value] of moduleClassStorage.entries()) {
            if (value === target) {
                return key;
            }
        }
        let moduleId;
        PLATFORM.eachModule((key, val) => {
            if (typeof val === "object") {
                for (const name of Object.keys(val)) {
                    if (val[name] === target || name === target.name) {
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
        moduleClassStorage.set(moduleId, target);
        return moduleId;
    },
    getTarget(moduleId) {
        const target = moduleClassStorage.get(moduleId);
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
        target = routerMetadata.getTarget(targetOrModuleId);
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
        moduleId = routerMetadata.getModuleId(targetOrModuleId);
    }
    else {
        throw new Error(`${targetOrModuleId} is neither a string nor a function`);
    }
    return moduleId;
}
//# sourceMappingURL=router-metadata.js.map