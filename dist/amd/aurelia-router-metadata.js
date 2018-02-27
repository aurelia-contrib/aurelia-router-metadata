define(["require", "exports", "./aurelia-router-metadata", "./decorators", "./resource-loader", "./router-resource", "./route-config-factory", "./router-metadata-configuration", "./router-metadata"], function (require, exports, aurelia_router_metadata_1, decorators_1, resource_loader_1, router_resource_1, route_config_factory_1, router_metadata_configuration_1, router_metadata_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    function configure(fxconfig, configureSettings) {
        const settings = new aurelia_router_metadata_1.RouterMetadataSettings();
        if (typeof configureSettings === "function") {
            configureSettings(settings);
        }
        const container = fxconfig.container;
        const config = new aurelia_router_metadata_1.RouterMetadataConfiguration(container);
        aurelia_router_metadata_1.RouterMetadataConfiguration.INSTANCE = config;
        container.registerInstance(aurelia_router_metadata_1.RouterMetadataSettings, settings);
        container.registerInstance(aurelia_router_metadata_1.RouterMetadataConfiguration, config);
    }
    exports.configure = configure;
    __export(decorators_1);
    __export(resource_loader_1);
    __export(router_resource_1);
    __export(route_config_factory_1);
    __export(router_metadata_configuration_1);
    __export(router_metadata_1);
});
