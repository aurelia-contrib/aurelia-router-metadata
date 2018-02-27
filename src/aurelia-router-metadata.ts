import { Container } from "aurelia-dependency-injection";
import { RouterMetadataConfiguration, RouterMetadataSettings } from "./aurelia-router-metadata";

export function configure(fxconfig: any, configureSettings: (settings: RouterMetadataSettings) => void): void {
  const settings = new RouterMetadataSettings();
  if (typeof configureSettings === "function") {
    configureSettings(settings);
  }
  const container = fxconfig.container as Container;
  const config = new RouterMetadataConfiguration(container);
  RouterMetadataConfiguration.INSTANCE = config;
  container.registerInstance(RouterMetadataSettings, settings);
  container.registerInstance(RouterMetadataConfiguration, config);
}

export * from "./interfaces";
export * from "./decorators";
export * from "./resource-loader";
export * from "./router-resource";
export * from "./route-config-factory";
export * from "./router-metadata-configuration";
export * from "./router-metadata";
