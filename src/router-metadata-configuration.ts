import { Container } from "aurelia-dependency-injection";
import { PLATFORM } from "aurelia-pal";
import { IModuleLoader } from "./interfaces";
import { DefaultRouteConfigFactory, RouteConfigFactory } from "./route-config-factory";
import { RouterMetadataSettings } from "./router-metadata-settings";

/**
 * Class used to configure behavior of [[RoutableResource]]
 */
export class RouterMetadataConfiguration {
  protected static instance: RouterMetadataConfiguration;
  /**
   * Gets the global configuration instance. This will be automatically resolved from
   * [[Container.instance]] and assigned when first accessed.
   */
  public static get INSTANCE(): RouterMetadataConfiguration {
    if (!this.instance) {
      this.instance = Container.instance.get(RouterMetadataConfiguration);
    }

    return this.instance;
  }
  /**
   * Sets the global configuration instance. Should be configured before setRoot()
   * for changes to propagate.
   */
  public static set INSTANCE(instance: RouterMetadataConfiguration) {
    this.instance = instance;
  }

  protected container: Container;

  /**
   * @param container Optionally pass in a container to use for resolving the dependencies
   * that this class resolves. Will default to Container.instance if null.
   */
  constructor(container?: Container) {
    this.container = container || Container.instance;
  }

  /**
   * Gets the RouteConfigFactory that is registered with DI, or defaults to
   * [[DefaultRouteConfigFactory]] if its not registered.
   * @param container Optionally pass in a container to use for resolving this dependency.
   * Can be a ChildContainer in to scope certain overrides for certain viewModels.
   */
  public getConfigFactory(container?: Container): RouteConfigFactory {
    const c = container || this.container;

    if (!c.hasResolver(RouteConfigFactory)) {
      c.registerSingleton(RouteConfigFactory, DefaultRouteConfigFactory);
    }

    return c.get(RouteConfigFactory);
  }

  /**
   * Gets the RouterMetadataSettings that is registered with DI, or creates
   * a default one with noop functions if its not registered.
   * @param container Optionally pass in a container to use for resolving this dependency.
   * Can be a ChildContainer in to scope certain overrides for certain viewModels.
   */
  public getSettings(container?: Container): RouterMetadataSettings {
    const c = container || this.container;

    return c.get(RouterMetadataSettings);
  }

  /**
   * Gets the Loader instance that is registered with the PLATFORM.Loader key
   * Mostly intended for unit testing where module loading needs to be mocked,
   * but can be overriden if needed.
   * @param container Optionally pass in a container to use for resolving this dependency.
   * Can be a ChildContainer in to scope certain overrides for certain viewModels.
   */
  public getModuleLoader(container?: Container): IModuleLoader {
    const c = container || this.container;

    return c.get(PLATFORM.Loader);
  }
}
