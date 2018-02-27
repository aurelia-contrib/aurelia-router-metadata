"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const aurelia_router_metadata_1 = require("./aurelia-router-metadata");
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
__export(require("./decorators"));
__export(require("./resource-loader"));
__export(require("./router-resource"));
__export(require("./route-config-factory"));
__export(require("./router-metadata-configuration"));
__export(require("./router-metadata"));
