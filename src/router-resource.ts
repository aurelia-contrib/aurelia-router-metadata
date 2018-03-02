import { Container } from "aurelia-dependency-injection";
import { getLogger, Logger } from "aurelia-logging";
import { AppRouter, Router, RouterConfiguration } from "aurelia-router";
import {
  ICompleteRouteConfig,
  IConfigureRouterInstruction,
  ICreateRouteConfigInstruction,
  IResourceLoader,
  IRouteConfigInstruction,
  IRouterConfiguration,
  IRouterResourceTarget,
  IRouterResourceTargetProto
} from "./interfaces";
import { RouteConfigFactory } from "./route-config-factory";
import { routerMetadata } from "./router-metadata";
import { RouterMetadataConfiguration, RouterMetadataSettings } from "./router-metadata-configuration";

const configureRouterSymbol = (Symbol("configureRouter") as any) as string;
type ConfigureRouter = (config: RouterConfiguration, router: Router) => Promise<void> | PromiseLike<void> | void;

const logger = getLogger("router-metadata") as Logger;

/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
export class RouterResource {
  /**
   * The target ("constructor Function") of the class this resource applies to
   */
  public target: IRouterResourceTarget;

  /**
   * The moduleId (`PLATFORM.moduleName`) of the class this resource applies to
   */
  public moduleId?: string;

  /**
   * True if this resource is a `@routeConfig`
   */
  public isRouteConfig: boolean;

  /**
   * True if this resource is a `@configureRouter`
   */
  public isConfigureRouter: boolean;

  /**
   * Only applicable when `isConfigureRouter`
   *
   * The moduleIds (`PLATFORM.moduleName`) of the routes that will be mapped on the target class' router
   */
  public routeConfigModuleIds: string[];

  /**
   * Only applicable when `isConfigureRouter`
   *
   * If true: when `loadChildRoutes()`is called on this instance, it will also call `loadChildRoutes()` on the resources
   * associated with the `routeConfigModuleIds` set on this instance (if they are also `@configureRouter`)
   */
  public enableEagerLoading: boolean;

  /**
   * Only applicable when `isRouteConfig`
   *
   * The `RouteConfig` objects with which the target's class is mapped in parent `@configureRouter`
   */
  public ownRoutes: ICompleteRouteConfig[];

  /**
   * Only applicable when `isConfigureRouter`
   *
   * The `RouteConfig` objects that will be mapped on the target class' router
   */
  public childRoutes: ICompleteRouteConfig[];

  /**
   * Only applicable when `isConfigureRouter`
   *
   * Filter function to determine which `RouteConfig` objects to exclude from mapping on the target class' router
   */
  public filterChildRoutes: (
    config: ICompleteRouteConfig,
    allConfigs: ICompleteRouteConfig[],
    configureInstruction: IConfigureRouterInstruction
  ) => boolean | Promise<boolean> | PromiseLike<boolean>;

  /**
   * Only applicable when `isRouteConfig`
   *
   * Instruction that describes how the RouteConfigs (ownRoutes) should be created when the routes
   * are requested to be loaded.
   */
  public createRouteConfigInstruction: ICreateRouteConfigInstruction;

  /**
   * Only applicable when `isConfigureRouter`
   *
   * True if `loadChildRoutes()` has run on this instance
   */
  public areChildRoutesLoaded: boolean;

  /**
   * Only applicable when `isRouteConfig`
   *
   * True if `loadOwnRoutes()` has run on this instance
   */
  public areOwnRoutesLoaded: boolean;

  /**
   * Only applicable when `isConfigureRouter`
   *
   * True if `configureRouter()` was invoked on the target class, and we are currently still loading the child routes
   */
  public isConfiguringRouter: boolean;

  /**
   * Only applicable when `isConfigureRouter`
   *
   * True if `configureRouter()` has run on this instance and the childRoutes are mapped to the target class' router
   */
  public isRouterConfigured: boolean;

  /**
   * The parent route
   */
  public parent: RouterResource;

  /**
   * Only applicable when `isConfigureRouter`
   *
   * The router that was passed to the target class' `configureRouter()` method
   */
  public router: Router;

  /**
   * Only applicable when `isConfigureRouter`
   *
   * A convenience property which returns `router.container`, or `null` if the router is not set
   */
  public get container(): Container {
    return this.router ? this.router.container : (null as any);
  }

  /**
   * Only applicable when `isConfigureRouter`
   *
   * A convenience property which returns `router.container.viewModel`, or `null` if the router is not set
   * This is an instance of the target class
   */
  public get instance(): IRouterResourceTargetProto {
    return this.container ? (this.container as any).viewModel : null;
  }

  /**
   * Returns a concatenation separated by '/' of the name of the first of `ownRoutes` of this instance,
   * together with the parents up to the root
   */
  public get path(): string {
    const ownName = this.ownRoutes.length > 0 ? this.ownRoutes[0].name : "";
    const parentPath = this.parent ? this.parent.path : null;

    return parentPath ? `${parentPath}/${ownName}` : ownName;
  }

  constructor(target: IRouterResourceTarget, moduleId?: string) {
    this.target = target;
    this.moduleId = moduleId;
    this.isRouteConfig = false;
    this.isConfigureRouter = false;
    this.routeConfigModuleIds = [];
    this.enableEagerLoading = false;
    this.createRouteConfigInstruction = null as any;
    this.ownRoutes = [];
    this.childRoutes = [];
    this.filterChildRoutes = null as any;
    this.areChildRoutesLoaded = false;
    this.areOwnRoutesLoaded = false;
    this.isConfiguringRouter = false;
    this.isRouterConfigured = false;
    this.parent = null as any;
    this.router = null as any;
  }

  /**
   * Creates a `@routeConfig` based on the provided instruction.
   *
   * This method is called by the `@routeConfig()` decorator, and can be used instead of the @routeConfig() decorator
   * to achieve the same effect.
   * @param instruction Instruction containing the parameters passed to the `@routeConfig` decorator
   */
  public static ROUTE_CONFIG(instruction: IRouteConfigInstruction): RouterResource {
    const resource = routerMetadata.getOrCreateOwn(instruction.target);
    resource.initialize(instruction);

    return resource;
  }

  /**
   * Creates a `@configureRouter` based on the provided instruction.
   *
   * This method is called by the `@configureRouter()` decorator, and can be used instead of the @configureRouter() decorator
   * to achieve the same effect.
   * @param instruction Instruction containing the parameters passed to the `@configureRouter` decorator
   */
  public static CONFIGURE_ROUTER(instruction: IConfigureRouterInstruction): RouterResource {
    const resource = routerMetadata.getOrCreateOwn(instruction.target);
    resource.initialize(instruction);

    return resource;
  }

  /**
   * Initializes this resource based on the provided instruction.
   *
   * This method is called by the static `ROUTE_CONFIG` and `CONFIGURE_ROUTER` methods, and can be used instead of those
   * to achieve the same effect. If there is a `routeConfigModuleIds` property present on the instruction, it will
   * be initialized as `configureRouter`, otherwise as `routeConfig`
   * @param instruction Instruction containing the parameters passed to the `@configureRouter` decorator
   */
  public initialize(instruction?: IRouteConfigInstruction | IConfigureRouterInstruction): void {
    if (!instruction) {
      // We're not being called from a decorator, so just apply defaults as if we're a @routeConfig
      // tslint:disable-next-line:no-parameter-reassignment
      instruction = { target: this.target };
    }
    const settings = this.getSettings(instruction);
    const target = instruction.target;
    if (isConfigureRouterInstruction(instruction)) {
      logger.debug(`initializing @configureRouter for ${target.name}`);

      this.isConfigureRouter = true;
      const configureInstruction = instruction as IConfigureRouterInstruction;

      this.routeConfigModuleIds = ensureArray(configureInstruction.routeConfigModuleIds);
      this.filterChildRoutes = settings.filterChildRoutes;
      this.enableEagerLoading = settings.enableEagerLoading;

      assignOrProxyPrototypeProperty(target.prototype, "configureRouter", configureRouterSymbol, configureRouter);
    } else {
      logger.debug(`initializing @routeConfig for ${target.name}`);

      this.isRouteConfig = true;
      const configInstruction = instruction as IRouteConfigInstruction;

      this.createRouteConfigInstruction = { ...configInstruction, settings };
    }
  }

  public async loadOwnRoutes(router?: Router): Promise<ICompleteRouteConfig[]> {
    this.router = router || (null as any);
    if (this.areOwnRoutesLoaded) {
      return this.ownRoutes;
    }

    // If we're in this method then it can never be the root, so it's always safe to apply @routeConfig initialization
    if (!this.isRouteConfig) {
      this.isRouteConfig = true;
      this.initialize(this.createRouteConfigInstruction);
    }

    const instruction = this.createRouteConfigInstruction;
    instruction.moduleId = instruction.moduleId || this.moduleId;

    const configs = await this.getConfigFactory().createRouteConfigs(instruction);
    for (const config of configs) {
      config.settings.routerResource = this;
      this.ownRoutes.push(config);
    }

    this.areOwnRoutesLoaded = true;

    return this.ownRoutes;
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
  public async loadChildRoutes(router?: Router): Promise<ICompleteRouteConfig[]> {
    this.router = router || (null as any);
    if (this.areChildRoutesLoaded) {
      return this.childRoutes;
    }

    logger.debug(`loading childRoutes for ${this.target.name}`);

    const loader = this.getResourceLoader();

    for (const moduleId of this.routeConfigModuleIds) {
      const resource = await loader.loadRouterResource(moduleId);
      const childRoutes = await resource.loadOwnRoutes();
      resource.parent = this;
      if (resource.isConfigureRouter && this.enableEagerLoading) {
        await resource.loadChildRoutes();
      }
      for (const childRoute of childRoutes) {
        if (await this.filterChildRoutes(childRoute, childRoutes, this)) {
          if (this.ownRoutes.length > 0) {
            childRoute.settings.parentRoute = this.ownRoutes[0];
          }
          this.childRoutes.push(childRoute);
        }
      }
    }

    if (this.isRouteConfig) {
      const ownRoutes = await this.loadOwnRoutes();
      for (const ownRoute of ownRoutes) {
        ownRoute.settings.childRoutes = this.childRoutes;
      }
    }

    this.areChildRoutesLoaded = true;

    return this.childRoutes;
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
    assignPaths(routes);
    config.map(routes);

    this.router = router;
    if (router instanceof AppRouter) {
      const settingsConfig = this.getSettings().routerConfiguration || ({} as any);
      mergeRouterConfiguration(config, settingsConfig);
    }

    this.isRouterConfigured = true;
    this.isConfiguringRouter = false;

    const originalConfigureRouter = this.target.prototype[configureRouterSymbol] as ConfigureRouter;
    if (originalConfigureRouter !== undefined) {
      return originalConfigureRouter.call((router.container as any).viewModel, config, router);
    }
  }

  protected getSettings(instruction?: IRouteConfigInstruction | IConfigureRouterInstruction): RouterMetadataSettings {
    const settings = RouterMetadataConfiguration.INSTANCE.getSettings(this.container);
    if (instruction) {
      Object.assign(settings, instruction.settings || {});
    }

    return settings;
  }

  protected getConfigFactory(): RouteConfigFactory {
    return RouterMetadataConfiguration.INSTANCE.getConfigFactory(this.container);
  }

  protected getResourceLoader(): IResourceLoader {
    return RouterMetadataConfiguration.INSTANCE.getResourceLoader(this.container);
  }
}

function isConfigureRouterInstruction(instruction: IRouteConfigInstruction | IConfigureRouterInstruction): boolean {
  return !!(instruction as IConfigureRouterInstruction).routeConfigModuleIds;
}

function ensureArray<T>(value: T | undefined | T[]): T[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function assignPaths(routes: ICompleteRouteConfig[]): void {
  for (const route of routes) {
    const parentPath = route.settings.parentRoute ? route.settings.parentRoute.settings.path : "";
    const pathProperty = route.settings.pathProperty || "route";
    const path = route[pathProperty];
    route.settings.path = `${parentPath}/${path}`.replace(/\/\//g, "/");

    assignPaths(route.settings.childRoutes || []);
  }
}

function assignOrProxyPrototypeProperty(
  proto: IRouterResourceTargetProto,
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
async function configureRouter(this: any, config: RouterConfiguration, router: Router): Promise<void> {
  const target = Object.getPrototypeOf(this).constructor as IRouterResourceTarget;
  const resource = routerMetadata.getOwn(target);
  await resource.configureRouter(config, router);
}
// tslint:enable:no-invalid-this

function mergeRouterConfiguration(target: RouterConfiguration, source: IRouterConfiguration): RouterConfiguration {
  target.instructions = (target.instructions || []).concat(source.instructions || []);
  target.options = { ...(target.options || {}), ...(source.options || {}) };
  target.pipelineSteps = (target.pipelineSteps || []).concat((source.pipelineSteps as any) || []);
  target.title = source.title as string;
  target.unknownRouteConfig = source.unknownRouteConfig;
  target.viewPortDefaults = { ...(target.viewPortDefaults || {}), ...(source.viewPortDefaults || {}) };

  return target;
}
