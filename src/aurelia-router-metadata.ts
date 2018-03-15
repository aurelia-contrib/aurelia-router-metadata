import { Registry } from "@src/registry";
import { ResourceLoader } from "@src/resource-loader";
import { routerMetadata } from "@src/router-metadata";
import { RouterMetadataConfiguration, RouterMetadataSettings } from "@src/router-metadata-configuration";
import { RouterResource } from "@src/router-resource";
import { Container } from "aurelia-dependency-injection";
import { Loader } from "aurelia-loader";

// tslint:disable:no-invalid-this

export function configure(fxconfig: any, configureSettings: (settings: RouterMetadataSettings) => void): void {
  const settings = new RouterMetadataSettings();
  if (typeof configureSettings === "function") {
    configureSettings(settings);
  }
  const container = fxconfig.container as Container;
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
    set: function(value: any): void {
      routerMetadata.getOrCreateOwn(value.constructor).initialize();
      (this as any)[RouterResource.viewModelSymbol] = value;
    },
    get: function(): any {
      return (this as any)[RouterResource.viewModelSymbol];
    }
  });
}

export * from "@src/resolution/builders";
export * from "@src/resolution/core";
export * from "@src/resolution/functions";
export * from "@src/resolution/interfaces";
export * from "@src/resolution/mapping";
export * from "@src/resolution/queries";
export * from "@src/resolution/requests";
export * from "@src/resolution/specifications";
export * from "@src/decorators";
export * from "@src/interfaces";
export * from "@src/model";
export * from "@src/registry";
export * from "@src/resource-loader";
export * from "@src/route-config-factory";
export * from "@src/router-metadata-configuration";
export * from "@src/router-metadata";
export * from "@src/router-resource";
