import { Container } from "aurelia-dependency-injection";
import { RouterConfiguration } from "aurelia-router";
import {
  ICompleteRouteConfig,
  IConfigureRouterInstruction,
  ICreateRouteConfigInstruction,
  IResourceLoader,
  IRouteConfig,
  IRouterConfiguration
} from "./interfaces";
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

const noTransform = (configs: ICompleteRouteConfig[]): ICompleteRouteConfig[] => configs;
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
  public routeConfigDefaults: IRouteConfig;

  /**
   * RouteConfig settings that will be applied last before transformation; these settings will override all other defaults and arguments
   */
  public routeConfigOverrides: IRouteConfig;

  /**
   * Perform any final modifications on the routes just before they are stored in the metadata
   * @param configs The route configs that were created by the @routeConfig() decorator
   * @param createInstruction The create instruction that was passed to the RouteConfigFactory
   */
  public transformRouteConfigs: (
    configs: ICompleteRouteConfig[],
    createInstruction: ICreateRouteConfigInstruction
  ) => ICompleteRouteConfig[];

  /**
   * Filter which routes from a @routeConfig are added to a @configureRouter's childRoutes
   */
  public filterChildRoutes: (
    config: ICompleteRouteConfig,
    allConfigs: ICompleteRouteConfig[],
    configureInstruction: IConfigureRouterInstruction
  ) => boolean;

  /**
   * Enable/disable eager loading by default
   */
  public enableEagerLoading: boolean;

  /**
   * Specify RouterConfiguration properties that need to be set on the AppRouter
   */
  public routerConfiguration: IRouterConfiguration;

  constructor() {
    this.routeConfigDefaults = defaults;
    this.routeConfigOverrides = overrides;
    this.transformRouteConfigs = noTransform;
    this.filterChildRoutes = noFilter;
    this.enableEagerLoading = true;

    this.routerConfiguration = new RouterConfiguration() as any;
  }
}
