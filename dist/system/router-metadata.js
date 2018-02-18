System.register(["aurelia-metadata", "aurelia-pal", "./routable-resource"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
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
    var aurelia_metadata_1, aurelia_pal_1, routable_resource_1, metadataKey, moduleClassStorage, routerMetadata;
    return {
        setters: [
            function (aurelia_metadata_1_1) {
                aurelia_metadata_1 = aurelia_metadata_1_1;
            },
            function (aurelia_pal_1_1) {
                aurelia_pal_1 = aurelia_pal_1_1;
            },
            function (routable_resource_1_1) {
                routable_resource_1 = routable_resource_1_1;
            }
        ],
        execute: function () {
            metadataKey = "aurelia:router-metadata";
            // tslint:disable-next-line:no-single-line-block-comment
            /** @internal */
            exports_1("moduleClassStorage", moduleClassStorage = new Map());
            exports_1("routerMetadata", routerMetadata = {
                getOwn(targetOrModuleId) {
                    return aurelia_metadata_1.metadata.getOwn(metadataKey, getTarget(targetOrModuleId));
                },
                define(resource, target) {
                    aurelia_metadata_1.metadata.define(metadataKey, resource, target);
                },
                getOrCreateOwn(targetOrModuleId) {
                    let result = routerMetadata.getOwn(targetOrModuleId);
                    if (result === undefined) {
                        const target = getTarget(targetOrModuleId);
                        const moduleId = getModuleId(targetOrModuleId);
                        result = new routable_resource_1.RoutableResource(moduleId, target);
                        aurelia_metadata_1.metadata.define(metadataKey, result, target);
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
                    aurelia_pal_1.PLATFORM.eachModule((key, val) => {
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
            });
        }
    };
});
//# sourceMappingURL=router-metadata.js.map