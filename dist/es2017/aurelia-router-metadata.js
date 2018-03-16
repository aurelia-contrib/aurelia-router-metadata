import { Container } from "aurelia-dependency-injection";
import { Loader } from "aurelia-loader";
import { Registry } from "./registry";
import { ResourceLoader } from "./resource-loader";
import { routerMetadata } from "./router-metadata";
import { RouterMetadataConfiguration, RouterMetadataSettings } from "./router-metadata-configuration";
import { RouterResource } from "./router-resource";
// tslint:disable:no-invalid-this
export function configure(fxconfig, configureSettings) {
    const settings = new RouterMetadataSettings();
    if (typeof configureSettings === "function") {
        configureSettings(settings);
    }
    const container = fxconfig.container;
    const config = new RouterMetadataConfiguration(container).makeGlobal();
    container.registerInstance(RouterMetadataSettings, settings);
    container.registerInstance(RouterMetadataConfiguration, config);
    const loader = container.get(Loader);
    const registry = new Registry();
    const resourceLoader = new ResourceLoader(loader, registry);
    container.registerInstance(Registry, registry);
    container.registerInstance(ResourceLoader, resourceLoader);
    Object.defineProperty(Container.prototype, RouterResource.viewModelSymbol, {
        enumerable: false,
        configurable: true,
        writable: true
    });
    Object.defineProperty(Container.prototype, "viewModel", {
        enumerable: true,
        configurable: true,
        set: function (value) {
            routerMetadata.getOrCreateOwn(value.constructor).initialize();
            this[RouterResource.viewModelSymbol] = value;
        },
        get: function () {
            return this[RouterResource.viewModelSymbol];
        }
    });
}
export * from "./resolution/builders";
export * from "./resolution/core";
export * from "./resolution/functions";
export * from "./resolution/mapping";
export * from "./resolution/queries";
export * from "./resolution/requests";
export * from "./resolution/specifications";
export * from "./decorators";
export * from "./model";
export * from "./registry";
export * from "./resource-loader";
export * from "./route-config-factory";
export * from "./router-metadata-configuration";
export * from "./router-metadata";
export * from "./router-resource";
//# sourceMappingURL=aurelia-router-metadata.js.map