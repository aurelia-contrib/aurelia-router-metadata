System.register(["aurelia-metadata", "./router-resource"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var aurelia_metadata_1, router_resource_1, metadataKey, routerMetadata;
    return {
        setters: [
            function (aurelia_metadata_1_1) {
                aurelia_metadata_1 = aurelia_metadata_1_1;
            },
            function (router_resource_1_1) {
                router_resource_1 = router_resource_1_1;
            }
        ],
        execute: function () {
            metadataKey = "aurelia:router-metadata";
            exports_1("routerMetadata", routerMetadata = {
                getOwn(target) {
                    return aurelia_metadata_1.metadata.getOwn(metadataKey, target);
                },
                define(resource, target) {
                    aurelia_metadata_1.metadata.define(metadataKey, resource, target);
                },
                getOrCreateOwn(target, moduleId) {
                    let result = routerMetadata.getOwn(target);
                    if (result === undefined) {
                        result = new router_resource_1.RouterResource(target, moduleId);
                        aurelia_metadata_1.metadata.define(metadataKey, result, target);
                    }
                    return result;
                }
            });
        }
    };
});
