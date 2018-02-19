import { Container } from "aurelia-dependency-injection";
import { PLATFORM } from "aurelia-pal";
import { IModuleLoader } from "./interfaces";
import { DefaultRouteConfigFactory, RouteConfigFactory } from "./route-config-factory";
import { RouterMetadataSettings } from "./router-metadata-settings";

export class RouterMetadataConfiguration {
  protected static instance: RouterMetadataConfiguration;
  public static get INSTANCE(): RouterMetadataConfiguration {
    if (!this.instance) {
      this.instance = Container.instance.get(RouterMetadataConfiguration);
    }

    return this.instance;
  }
  public static set INSTANCE(instance: RouterMetadataConfiguration) {
    this.instance = instance;
  }

  protected container: Container;

  constructor(container?: Container) {
    this.container = container || Container.instance;
  }

  public getConfigFactory(container?: Container): RouteConfigFactory {
    const c = container || this.container;

    if (!c.hasResolver(RouteConfigFactory)) {
      c.registerSingleton(RouteConfigFactory, DefaultRouteConfigFactory);
    }

    return c.get(RouteConfigFactory);
  }
  public getSettings(container?: Container): RouterMetadataSettings {
    const c = container || this.container;

    return c.get(RouterMetadataSettings);
  }
  public getModuleLoader(container?: Container): IModuleLoader {
    const c = container || this.container;

    return c.get(PLATFORM.Loader);
  }
}
