"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
const aurelia_loader_1 = require("aurelia-loader");
const registry_1 = require("./registry");
const resource_loader_1 = require("./resource-loader");
const router_metadata_1 = require("./router-metadata");
const router_metadata_configuration_1 = require("./router-metadata-configuration");
const router_resource_1 = require("./router-resource");
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
__export(require("./resolution/builders"));
__export(require("./resolution/core"));
__export(require("./resolution/functions"));
__export(require("./resolution/mapping"));
__export(require("./resolution/queries"));
__export(require("./resolution/requests"));
__export(require("./resolution/specifications"));
__export(require("./decorators"));
__export(require("./model"));
__export(require("./registry"));
__export(require("./resource-loader"));
__export(require("./route-config-factory"));
__export(require("./router-metadata-configuration"));
__export(require("./router-metadata"));
__export(require("./router-resource"));
//# sourceMappingURL=aurelia-router-metadata.js.map