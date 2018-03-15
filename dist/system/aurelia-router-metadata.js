System.register(["aurelia-dependency-injection", "aurelia-loader", "./registry", "./resource-loader", "./router-metadata", "./router-metadata-configuration", "./router-resource", "./resolution/builders", "./resolution/core", "./resolution/functions", "./resolution/mapping", "./resolution/queries", "./resolution/requests", "./resolution/specifications", "./decorators", "./model", "./route-config-factory"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    // tslint:disable:no-invalid-this
    function configure(fxconfig, configureSettings) {
        const settings = new router_metadata_configuration_1.RouterMetadataSettings();
        if (typeof configureSettings === "function") {
            configureSettings(settings);
        }
        const container = fxconfig.container;
        const config = new router_metadata_configuration_1.RouterMetadataConfiguration(container).makeGlobal();
        container.registerInstance(router_metadata_configuration_1.RouterMetadataSettings, settings);
        container.registerInstance(router_metadata_configuration_1.RouterMetadataConfiguration, config);
        const loader = container.get(aurelia_loader_1.Loader);
        const registry = new registry_1.Registry();
        const resourceLoader = new resource_loader_1.ResourceLoader(loader, registry);
        container.registerInstance(registry_1.Registry, registry);
        container.registerInstance(resource_loader_1.ResourceLoader, resourceLoader);
        Object.defineProperty(aurelia_dependency_injection_1.Container.prototype, router_resource_1.RouterResource.viewModelSymbol, {
            enumerable: false,
            configurable: true,
            writable: true
        });
        Object.defineProperty(aurelia_dependency_injection_1.Container.prototype, "viewModel", {
            enumerable: true,
            configurable: true,
            set: function (value) {
                router_metadata_1.routerMetadata.getOrCreateOwn(value.constructor).initialize();
                this[router_resource_1.RouterResource.viewModelSymbol] = value;
            },
            get: function () {
                return this[router_resource_1.RouterResource.viewModelSymbol];
            }
        });
    }
    exports_1("configure", configure);
    var aurelia_dependency_injection_1, aurelia_loader_1, registry_1, resource_loader_1, router_metadata_1, router_metadata_configuration_1, router_resource_1;
    var exportedNames_1 = {
        "configure": true
    };
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default" && !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters: [
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (aurelia_loader_1_1) {
                aurelia_loader_1 = aurelia_loader_1_1;
            },
            function (registry_1_1) {
                registry_1 = registry_1_1;
                exportStar_1(registry_1_1);
            },
            function (resource_loader_1_1) {
                resource_loader_1 = resource_loader_1_1;
                exportStar_1(resource_loader_1_1);
            },
            function (router_metadata_1_1) {
                router_metadata_1 = router_metadata_1_1;
                exportStar_1(router_metadata_1_1);
            },
            function (router_metadata_configuration_1_1) {
                router_metadata_configuration_1 = router_metadata_configuration_1_1;
                exportStar_1(router_metadata_configuration_1_1);
            },
            function (router_resource_1_1) {
                router_resource_1 = router_resource_1_1;
                exportStar_1(router_resource_1_1);
            },
            function (builders_1_1) {
                exportStar_1(builders_1_1);
            },
            function (core_1_1) {
                exportStar_1(core_1_1);
            },
            function (functions_1_1) {
                exportStar_1(functions_1_1);
            },
            function (mapping_1_1) {
                exportStar_1(mapping_1_1);
            },
            function (queries_1_1) {
                exportStar_1(queries_1_1);
            },
            function (requests_1_1) {
                exportStar_1(requests_1_1);
            },
            function (specifications_1_1) {
                exportStar_1(specifications_1_1);
            },
            function (decorators_1_1) {
                exportStar_1(decorators_1_1);
            },
            function (model_1_1) {
                exportStar_1(model_1_1);
            },
            function (route_config_factory_1_1) {
                exportStar_1(route_config_factory_1_1);
            }
        ],
        execute: function () {
        }
    };
});
