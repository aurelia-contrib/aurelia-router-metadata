import { Container } from "aurelia-dependency-injection";
import { Router, RouterConfiguration } from "aurelia-router";
import {
  ICompleteRouteConfig,
  IConfigureRouterInstruction,
  ICreateRouteConfigInstruction,
  IResourceLoader,
  IRouteConfig,
  IRouterConfiguration
} from "./interfaces";
import { Registry } from "./registry";
import { ResourceLoader } from "./resource-loader";
import { DefaultRouteConfigFactory, RouteConfigFactory } from "./route-config-factory";
import { RouterResource } from "./router-resource";

const noTransform = (configs: ICompleteRouteConfig[]): ICompleteRouteConfig[] => configs;
const noFilter = (): boolean => true;
// tslint:disable-next-line:no-empty
const noAction = (..._: any[]): void => {};
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
  ) => ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;

  /**
   * Filter which routes from a @routeConfig are added to a @configureRouter's childRoutes
   */
  public filterChildRoutes: (
    config: ICompleteRouteConfig,
    allConfigs: ICompleteRouteConfig[],
    configureInstruction: IConfigureRouterInstruction
  ) => boolean | Promise<boolean> | PromiseLike<boolean>;

  /**
   * Enable/disable eager loading by default
   */
  public enableEagerLoading: boolean;

  /**
   * Enable/disable static code analysis to extract RouteConfigs from `configureRouter` methods
   */
  public enableStaticAnalysis: boolean;

  /**
   * Specify RouterConfiguration properties that need to be set on the AppRouter
   */
  public routerConfiguration: IRouterConfiguration;

  /**
   * Called first when inside `configureRouter()`: childRoutes are not loaded, and no changes have
   * been made to the router, config or viewmodel yet.
   */
  public onBeforeLoadChildRoutes: (
    viewModelInstance: any,
    config: RouterConfiguration,
    router: Router,
    resource: RouterResource,
    ...lifeCycleArgs: any[]
  ) => void | Promise<void> | PromiseLike<void>;

  /**
   * Called directly after `loadChildRoutes()` and before `config.map(routes)`
   */
  public onBeforeConfigMap: (
    viewModelInstance: any,
    config: RouterConfiguration,
    router: Router,
    resource: RouterResource,
    childRoutes: ICompleteRouteConfig[],
    ...lifeCycleArgs: any[]
  ) => void | Promise<void> | PromiseLike<void>;

  /**
   * If true, target class will have its "router" property assigned from the proxied `configureRouter()` method.
   *
   * If a string is provided, the router will be assigned to the property with that name (implies true).
   *
   * If a function is provided, that function will be called during `configureRouter()` when normally the router would be assigned.
   * This is directly after `config.map(routes)` and before the RouterConfigurations are merged (if it's the root)
   */
  public assignRouterToViewModel:
    | boolean
    | string
    | ((
        viewModelInstance: any,
        config: RouterConfiguration,
        router: Router,
        resource: RouterResource,
        childRoutes: ICompleteRouteConfig[],
        ...lifeCycleArgs: any[]
      ) => void | Promise<void> | PromiseLike<void>);

  /**
   * Called directly after the RouterConfigurations are merged (if it's the root)
   */
  public onAfterMergeRouterConfiguration: (
    viewModelInstance: any,
    config: RouterConfiguration,
    router: Router,
    resource: RouterResource,
    childRoutes: ICompleteRouteConfig[],
    ...lifeCycleArgs: any[]
  ) => void | Promise<void> | PromiseLike<void>;

  constructor() {
    this.routeConfigDefaults = defaults;
    this.routeConfigOverrides = overrides;
    this.transformRouteConfigs = noTransform;
    this.filterChildRoutes = noFilter;
    this.enableEagerLoading = true;
    this.enableStaticAnalysis = true;

    this.routerConfiguration = new RouterConfiguration() as any;
    this.onBeforeLoadChildRoutes = noAction;
    this.onBeforeConfigMap = noAction;
    this.assignRouterToViewModel = false;
    this.onAfterMergeRouterConfiguration = noAction;
  }
}

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
    if (this.instance === undefined) {
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
  constructor(container?: Container | null) {
    this.container = container || Container.instance;
  }

  /**
   * Makes this configuration instance globally reachable through RouterMetadataConfiguration.INSTANCE
   */
  public makeGlobal(): RouterMetadataConfiguration {
    RouterMetadataConfiguration.INSTANCE = this;

    return this;
  }

  /**
   * Gets the RouteConfigFactory that is registered with DI, or defaults to
   * [[DefaultRouteConfigFactory]] if its not registered.
   * @param container Optionally pass in a container to use for resolving this dependency.
   * Can be a ChildContainer to scope certain overrides for certain viewModels.
   */
  public getConfigFactory(container?: Container | null): RouteConfigFactory {
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
  public getSettings(container?: Container | null): RouterMetadataSettings {
    const c = container || this.container;

    return c.get(RouterMetadataSettings);
  }

  /**
   * Gets the ResourceLoader that is registered with DI
   * @param container Optionally pass in a container to use for resolving this dependency.
   * Can be a ChildContainer to scope certain overrides for certain viewModels.
   */
  public getResourceLoader(container?: Container | null): IResourceLoader {
    const c = container || this.container;

    return c.get(ResourceLoader);
  }

  public getRegistry(container?: Container | null): Registry {
    const c = container || this.container;

    return c.get(Registry);
  }
}
