import { Container } from "aurelia-dependency-injection";
import { RouteConfig } from "aurelia-router";
import { IConfigureRouterInstruction, ICreateRouteConfigInstruction, IResourceLoader } from "./interfaces";
import { ResourceLoader } from "./resource-loader";
import { DefaultRouteConfigFactory, RouteConfigFactory } from "./route-config-factory";

/**
 * Class used to configure behavior of [[RouterResource]]
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
   * Can be a ChildContainer to scope certain overrides for certain viewModels.
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
   * Can be a ChildContainer to scope certain overrides for certain viewModels.
   */
  public getSettings(container?: Container): RouterMetadataSettings {
    const c = container || this.container;

    return c.get(RouterMetadataSettings);
  }

  /**
   * Gets the ResourceLoader that is registered with DI
   * @param container Optionally pass in a container to use for resolving this dependency.
   * Can be a ChildContainer to scope certain overrides for certain viewModels.
   */
  public getResourceLoader(container?: Container): IResourceLoader {
    const c = container || this.container;

    return c.get(ResourceLoader);
  }
}

const noTransform = (configs: RouteConfig[]): RouteConfig[] => configs;
const noFilter = (): boolean => true;
const defaults = {
  nav: true
};
const overrides = {};

/**
 * All available aurelia-router-metadata settings
 */
export class RouterMetadataSettings {
  [setting: string]: any;

  /**
   * The initial settings to use for each route before class-based conventions are applied
   */
  public routeConfigDefaults: RouteConfig;

  /**
   * RouteConfig settings that will be applied last before transformation; these settings will override all other defaults and arguments
   */
  public routeConfigOverrides: RouteConfig;

  /**
   * Perform any final modifications on the routes just before they are stored in the metadata
   * @param configs The route configs that were created by the @routeConfig() decorator
   * @param createInstruction The create instruction that was passed to the RouteConfigFactory
   */
  public transformRouteConfigs: (
    configs: RouteConfig[],
    createInstruction: ICreateRouteConfigInstruction
  ) => RouteConfig[];

  /**
   * Filter which routes from a @routeConfig are added to a @configureRouter's childRoutes
   */
  public filterChildRoutes: (
    config: RouteConfig,
    allConfigs: RouteConfig[],
    configureInstruction: IConfigureRouterInstruction
  ) => boolean;

  /**
   * Enable/disable eager loading by default
   */
  public enableEagerLoading: boolean;

  constructor() {
    this.routeConfigDefaults = defaults as any;
    this.routeConfigOverrides = overrides as any;
    this.transformRouteConfigs = noTransform;
    this.filterChildRoutes = noFilter;
    this.enableEagerLoading = true;
  }
}
