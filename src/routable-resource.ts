import { Container } from "aurelia-dependency-injection";
import { getLogger, Logger } from "aurelia-logging";
import { metadata } from "aurelia-metadata";
import { PLATFORM } from "aurelia-pal";
import { NavigationInstruction, NavModel, RouteConfig, Router, RouterConfiguration } from "aurelia-router";
import {
  IMapRoutablesInstruction,
  IModuleLoader,
  IRoutableInstruction,
  IRoutableResourceTarget,
  IRoutableResourceTargetProto,
  IRouteConfigInstruction
} from "./interfaces";
import { DefaultRouteConfigFactory, RouteConfigFactory } from "./route-config-factory";
import { routerMetadata } from "./router-metadata";
import { RouterMetadataConfiguration } from "./router-metadata-configuration";
import { RouterMetadataSettings } from "./router-metadata-settings";

const configureRouterSymbol = (Symbol("configureRouter") as any) as string;
type ConfigureRouter = (config: RouterConfiguration, router: Router) => Promise<void> | PromiseLike<void> | void;

const logger = getLogger("router-metadata") as Logger;

/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
export class RoutableResource {
  /**
   * The moduleId (`PLATFORM.moduleName`) of the class this resource applies to
   */
  public moduleId: string;
  /**
   * The target ("constructor Function") of the class this resource applies to
   */
  public target: IRoutableResourceTarget;

  /**
   * True if this resource is a `@routable`
   */
  public isRoutable: boolean;

  /**
   * True if this resource is a `@mapRoutables`
   */
  public isMapRoutables: boolean;

  /**
   * Only applicable when `isMapRoutables`
   *
   * The moduleIds (`PLATFORM.moduleName`) of the routes that will be mapped on the target class' router
   */
  public routableModuleIds: string[];

  /**
   * Only applicable when `isMapRoutables`
   *
   * If true: when `loadChildRoutes()`is called on this instance, it will also call `loadChildRoutes()` on the resources
   * associated with the `routableModuleIds` set on this instance (if they are also `@mapRoutables`)
   */
  public enableEagerLoading: boolean;

  /**
   * Only applicable when `isRoutable`
   *
   * The `RouteConfig` objects with which the target's class is mapped in parent `@mapRoutables`
   */
  public ownRoutes: RouteConfig[];

  /**
   * Only applicable when `isMapRoutables`
   *
   * The `RouteConfig` objects that will be mapped on the target class' router
   */
  public childRoutes: RouteConfig[];

  /**
   * Only applicable when `isMapRoutables`
   *
   * Filter function to determine which `RouteConfig` objects to exclude from mapping on the target class' router
   */
  public filterChildRoutes: (
    config: RouteConfig,
    allConfigs: RouteConfig[],
    mapInstruction: IMapRoutablesInstruction
  ) => boolean;

  /**
   * Only applicable when `isMapRoutables`
   *
   * True if `loadChildRoutes()` has run on this instance
   */
  public areChildRoutesLoaded: boolean;

  /**
   * Only applicable when `isMapRoutables`
   *
   * True if `loadChildRouteModules()` has run on this instance
   */
  public areChildRouteModulesLoaded: boolean;

  /**
   * Only applicable when `isMapRoutables`
   *
   * True if `configureRouter()` was invoked on the target class, and we are currently still loading the child routes
   */
  public isConfiguringRouter: boolean;

  /**
   * Only applicable when `isMapRoutables`
   *
   * True if `configureRouter()` has run on this instance and the childRoutes are mapped to the target class' router
   */
  public isRouterConfigured: boolean;

  /**
   * The parent route
   */
  public parent: RoutableResource;

  /**
   * Only applicable when `isMapRoutables`
   *
   * The router that was passed to the target class' `configureRouter()` method
   */
  public router: Router;

  /**
   * Only applicable when `isMapRoutables`
   *
   * A convenience property which returns `router.container`, or `null` if the router is not set
   */
  public get container(): Container {
    return this.router ? this.router.container : (null as any);
  }

  /**
   * Only applicable when `isMapRoutables`
   *
   * A convenience property which returns `router.container.viewModel`, or `null` if the router is not set
   * This is an instance of the target class
   */
  public get instance(): IRoutableResourceTargetProto {
    return this.container ? (this.container as any).viewModel : null;
  }

  /**
   * Returns a concatenation separated by '/' of the name of the first of `ownRoutes` of this instance,
   * together with the parents up to the root
   */
  public get path(): string {
    const ownName = (this.ownRoutes.length > 0 ? this.ownRoutes[0].name : null) as string;
    const parentPath = (this.parent ? this.parent.path : null) as string;

    return parentPath ? `${parentPath}/${ownName}` : ownName;
  }

  constructor(moduleId: string, target: Function) {
    this.moduleId = moduleId;
    this.target = target;
    this.isRoutable = false;
    this.isMapRoutables = false;
    this.routableModuleIds = [];
    this.enableEagerLoading = false;
    this.ownRoutes = [];
    this.childRoutes = [];
    this.filterChildRoutes = null as any;
    this.areChildRoutesLoaded = false;
    this.areChildRouteModulesLoaded = false;
    this.isConfiguringRouter = false;
    this.isRouterConfigured = false;
    this.parent = null as any;
    this.router = null as any;
  }

  /**
   * Creates a `@routable` based on the provided instruction.
   *
   * This method is called by the `@routable()` decorator, and can be used instead of the @routable() decorator
   * to achieve the same effect.
   * @param instruction Instruction containing the parameters passed to the `@routable` decorator
   */
  public static ROUTABLE(instruction: IRoutableInstruction): RoutableResource {
    const resource = routerMetadata.getOrCreateOwn(instruction.target);
    resource.initialize(instruction);

    return resource;
  }

  /**
   * Creates a `@mapRoutables` based on the provided instruction.
   *
   * This method is called by the `@mapRoutables()` decorator, and can be used instead of the @mapRoutables() decorator
   * to achieve the same effect.
   * @param instruction Instruction containing the parameters passed to the `@mapRoutables` decorator
   */
  public static MAP_ROUTABLES(instruction: IMapRoutablesInstruction): RoutableResource {
    const resource = routerMetadata.getOrCreateOwn(instruction.target);
    resource.initialize(instruction);

    return resource;
  }

  /**
   * Initializes this resource based on the provided instruction.
   *
   * This method is called by the static `ROUTABLE` and `MAP_ROUTABLES` methods, and can be used instead of those
   * to achieve the same effect. If there is a `routableModuleIds` property present on the instruction, it will
   * be initialized as `@mapRoutables`, otherwise as `@routable`. To initialize a class as both, you'll need to call
   * this method twice with the appropriate instruction.
   * @param instruction Instruction containing the parameters passed to the `@mapRoutables` decorator
   */
  public initialize(instruction: IRoutableInstruction | IMapRoutablesInstruction): void {
    const settings = this.getSettings(instruction);
    const moduleId = this.moduleId;
    const target = instruction.target;
    if (isMapRoutablesInstruction(instruction)) {
      logger.debug(`initializing @mapRoutables for ${moduleId}`);

      const mapInstruction = instruction as IMapRoutablesInstruction;

      this.isMapRoutables = true;
      this.routableModuleIds = ensureArray(mapInstruction.routableModuleIds);
      this.filterChildRoutes = settings.filterChildRoutes;
      this.enableEagerLoading = settings.enableEagerLoading;

      assignOrProxyPrototypeProperty(target.prototype, "configureRouter", configureRouterSymbol, configureRouter);
    } else {
      logger.debug(`initializing @routable for ${this.moduleId}`);

      this.isRoutable = true;

      const configInstruction = { ...instruction, moduleId, settings };
      const configs = this.getConfigFactory().createRouteConfigs(configInstruction);
      for (const config of configs) {
        config.settings.routableResource = this;
        this.ownRoutes.push(config);
      }
    }
  }

  /**
   * Retrieves the `RouteConfig` objects which were generated by all referenced moduleIds
   * and assigns them to `childRoutes`
   *
   * Will also call this method on child resources if `enableEagerLoading` is set to true.
   *
   * Will simply return the previously fetched `childRoutes` on subsequent calls.
   *
   * This method is called by `configureRouter()`.
   *
   * @param router (Optional) The router that was passed to the target instance's `configureRouter()`
   */
  public async loadChildRoutes(router?: Router): Promise<RouteConfig[]> {
    this.router = router || (null as any);
    if (this.areChildRoutesLoaded) {
      return this.childRoutes;
    }

    logger.debug(`loading childRoutes for ${this.moduleId}`);

    await this.loadChildRouteModules();

    for (const moduleId of this.routableModuleIds) {
      const resource = routerMetadata.getOwn(moduleId);
      resource.parent = this;
      if (resource.isMapRoutables && this.enableEagerLoading) {
        await resource.loadChildRoutes();
      }
      for (const childRoute of resource.ownRoutes) {
        if (this.filterChildRoutes(childRoute, resource.ownRoutes, this)) {
          if (this.ownRoutes.length > 0) {
            childRoute.settings.parentRoute = this.ownRoutes[0];
          }
          this.childRoutes.push(childRoute);
        }
      }
    }

    for (const ownRoute of this.ownRoutes) {
      ownRoute.settings.childRoutes = this.childRoutes;
    }

    this.areChildRoutesLoaded = true;

    return this.childRoutes;
  }

  /**
   * Tells the platform loader to load the `routableModuleIds` assigned to this resource
   *
   * If `enableEagerLoading` is set to true, will also call this method on all child resources.
   *
   * Will do nothing on subsequent calls.
   *
   * This method is called by `loadChildRoutes()`
   */
  public async loadChildRouteModules(): Promise<void> {
    if (this.areChildRouteModulesLoaded) {
      return;
    }

    await this.getModuleLoader().loadAllModules(this.routableModuleIds);

    if (this.enableEagerLoading) {
      for (const moduleId of this.routableModuleIds) {
        const resource = routerMetadata.getOwn(moduleId);
        resource.parent = this;
        if (resource.isMapRoutables) {
          await resource.loadChildRouteModules();
        }
      }
    }
    this.areChildRouteModulesLoaded = true;
  }

  /**
   * Calls `loadChildRoutes()` to fetch the referenced modulesIds' `RouteConfig` objects, and maps them to the router.
   *
   * This method will be assigned to `target.prototype.configureRouter`, such that the routes will be configured
   * even if there is no `configureRouter()` method present.
   *
   * If `target.prototype.configureRouter` already exists, a reference to that original method will be kept
   * and called at the end of this `configureRouter()` method.
   */
  public async configureRouter(config: RouterConfiguration, router: Router): Promise<void> {
    this.isConfiguringRouter = true;
    const routes = await this.loadChildRoutes();
    config.map(routes);

    this.router = router;
    this.isRouterConfigured = true;
    this.isConfiguringRouter = false;

    const originalConfigureRouter = this.target.prototype[configureRouterSymbol] as ConfigureRouter;
    if (originalConfigureRouter !== undefined) {
      return originalConfigureRouter.call((router.container as any).viewModel, config, router);
    }
  }

  protected getSettings(instruction?: IRoutableInstruction | IMapRoutablesInstruction): RouterMetadataSettings {
    const settings = RouterMetadataConfiguration.INSTANCE.getSettings(this.container);
    if (instruction) {
      return overrideSettings(settings, instruction);
    }

    return settings;
  }

  protected getConfigFactory(): RouteConfigFactory {
    return RouterMetadataConfiguration.INSTANCE.getConfigFactory(this.container);
  }

  protected getModuleLoader(): IModuleLoader {
    return RouterMetadataConfiguration.INSTANCE.getModuleLoader(this.container);
  }
}

function isMapRoutablesInstruction(instruction: IRoutableInstruction | IMapRoutablesInstruction): boolean {
  return !!(instruction as IMapRoutablesInstruction).routableModuleIds;
}

function overrideSettings(
  settings: RouterMetadataSettings,
  instruction: IRoutableInstruction | IMapRoutablesInstruction
): RouterMetadataSettings {
  if (isMapRoutablesInstruction(instruction)) {
    const mapInstruction = instruction as IMapRoutablesInstruction;
    if (mapInstruction.enableEagerLoading !== undefined) {
      settings.enableEagerLoading = mapInstruction.enableEagerLoading;
    }
    if (mapInstruction.filterChildRoutes !== undefined) {
      settings.filterChildRoutes = mapInstruction.filterChildRoutes;
    }
  } else {
    const routeInstruction = instruction as IRoutableInstruction;
    if (routeInstruction.transformRouteConfigs !== undefined) {
      settings.transformRouteConfigs = routeInstruction.transformRouteConfigs;
    }
  }

  return settings;
}

function ensureArray<T>(value: T | undefined | T[]): T[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function assignOrProxyPrototypeProperty(
  proto: IRoutableResourceTargetProto,
  name: string,
  refSymbol: string,
  value: any
): void {
  if (name in proto) {
    let protoOrBase = proto;
    while (!protoOrBase.hasOwnProperty(name)) {
      protoOrBase = Object.getPrototypeOf(protoOrBase);
    }
    const original = protoOrBase[name];
    proto[refSymbol] = original;
  }
  proto[name] = value;
}

// tslint:disable:no-invalid-this
async function configureRouter(config: RouterConfiguration, router: Router): Promise<void> {
  const target = Object.getPrototypeOf(this).constructor as IRoutableResourceTarget;
  const resource = routerMetadata.getOwn(target);
  await resource.configureRouter(config, router);
}
// tslint:enable:no-invalid-this
