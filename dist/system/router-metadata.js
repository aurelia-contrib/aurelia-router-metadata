System.register(["./router-resource"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
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
    var router_resource_1, key, resourceKey, routerMetadata;
    return {
        setters: [
            function (router_resource_1_1) {
                router_resource_1 = router_resource_1_1;
            }
        ],
        execute: function () {
            key = "__routerMetadata__";
            resourceKey = "resource";
            exports_1("routerMetadata", routerMetadata = {
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
            });
        }
    };
});
