define(["require", "exports", "@src/registry", "@src/resource-loader", "@src/router-metadata", "@src/router-metadata-configuration", "@src/router-resource", "aurelia-dependency-injection", "aurelia-loader", "@src/resolution/builders", "@src/resolution/core", "@src/resolution/functions", "@src/resolution/mapping", "@src/resolution/queries", "@src/resolution/requests", "@src/resolution/specifications", "@src/decorators", "@src/model", "@src/registry", "@src/resource-loader", "@src/route-config-factory", "@src/router-metadata-configuration", "@src/router-metadata", "@src/router-resource"], function (require, exports, registry_1, resource_loader_1, router_metadata_1, router_metadata_configuration_1, router_resource_1, aurelia_dependency_injection_1, aurelia_loader_1, builders_1, core_1, functions_1, mapping_1, queries_1, requests_1, specifications_1, decorators_1, model_1, registry_2, resource_loader_2, route_config_factory_1, router_metadata_configuration_2, router_metadata_2, router_resource_2) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
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
    exports.configure = configure;
    __export(builders_1);
    __export(core_1);
    __export(functions_1);
    __export(mapping_1);
    __export(queries_1);
    __export(requests_1);
    __export(specifications_1);
    __export(decorators_1);
    __export(model_1);
    __export(registry_2);
    __export(resource_loader_2);
    __export(route_config_factory_1);
    __export(router_metadata_configuration_2);
    __export(router_metadata_2);
    __export(router_resource_2);
});
