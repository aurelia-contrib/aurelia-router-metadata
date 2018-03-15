"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("@src/registry");
const resource_loader_1 = require("@src/resource-loader");
const router_metadata_1 = require("@src/router-metadata");
const router_metadata_configuration_1 = require("@src/router-metadata-configuration");
const router_resource_1 = require("@src/router-resource");
const aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
const aurelia_loader_1 = require("aurelia-loader");
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
__export(require("@src/resolution/builders"));
__export(require("@src/resolution/core"));
__export(require("@src/resolution/functions"));
__export(require("@src/resolution/mapping"));
__export(require("@src/resolution/queries"));
__export(require("@src/resolution/requests"));
__export(require("@src/resolution/specifications"));
__export(require("@src/decorators"));
__export(require("@src/model"));
__export(require("@src/registry"));
__export(require("@src/resource-loader"));
__export(require("@src/route-config-factory"));
__export(require("@src/router-metadata-configuration"));
__export(require("@src/router-metadata"));
__export(require("@src/router-resource"));
