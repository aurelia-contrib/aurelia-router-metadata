import { Container } from "aurelia-dependency-injection";
import { getLogger } from "aurelia-logging";
import { AppRouter, RouteConfig, Router, RouterConfiguration } from "aurelia-router";
import {
  ICompleteRouteConfig,
  IConfigureRouterInstruction,
  ICreateRouteConfigInstruction,
  IResourceLoader,
  IRouteConfig,
  IRouteConfigInstruction,
  IRouterConfiguration,
  IRouterResourceTarget,
  IRouterResourceTargetProto
} from "./interfaces";
import { $Module } from "./model";
import { Registry } from "./registry";
import { RouteConfigFactory } from "./route-config-factory";
import { routerMetadata } from "./router-metadata";
import { RouterMetadataConfiguration, RouterMetadataSettings } from "./router-metadata-configuration";
import { splitRouteConfig } from "./util";

type ConfigureRouter = (config: RouterConfiguration, router: Router) => Promise<void> | PromiseLike<void> | void;

const logger = getLogger("router-metadata");

/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
export class RouterResource {
  public static originalConfigureRouterSymbol: any = Symbol("configureRouter");
  public static originalMapSymbol: any = Symbol("map");
  public static viewModelSymbol: any = Symbol("viewModel");
  public static routerResourceSymbol: any = Symbol("routerResource");

  public $module: $Module | null;

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
   * Only applicable when `isConfigureRouter`
   *
   * If true: will look for `RouteConfig` objects in the `configureRouter()` method of the target class and treat them as if
   * they were defined in decorators.
   * Currently only works on non-async methods and the moduleId must be either a pure string or a `PLATFORM.moduleName` call.
   * Other properties will only be included if they are "hard-coded".
   */
  public enableStaticAnalysis: boolean;

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
  public filterChildRoutes:
    | ((
        config: ICompleteRouteConfig,
        allConfigs: ICompleteRouteConfig[],
        configureInstruction: IConfigureRouterInstruction
      ) => boolean | Promise<boolean> | PromiseLike<boolean>)
    | null;

  /**
   * Only applicable when `isRouteConfig`
   *
   * Instruction that describes how the RouteConfigs (ownRoutes) should be created when the routes
   * are requested to be loaded.
   */
  public createRouteConfigInstruction: ICreateRouteConfigInstruction | null;

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
   * All parents of this route
   */
  public parents: Set<RouterResource>;

  /**
   * The first (primary) parent of this route
   */
  public get parent(): RouterResource | null {
    return this.parents.keys().next().value || null;
  }

  /**
   * Only applicable when `isConfigureRouter`
   *
   * The router that was passed to the target class' `configureRouter()` method
   */
  public router: Router | null;

  /**
   * Only applicable when `isConfigureRouter`
   *
   * A convenience property which returns `router.container`, or `null` if the router is not set
   */
  public get container(): Container | null {
    return this.router ? this.router.container : null;
  }

  /**
   * Only applicable when `isConfigureRouter`
   *
   * A convenience property which returns `router.container.viewModel`, or `null` if the router is not set
   * This is an instance of the target class
   */
  public get instance(): IRouterResourceTargetProto | null {
    return this.container ? (this.container as any).viewModel : null;
  }

  constructor(target: IRouterResourceTarget, moduleId?: string) {
    this.$module = null;
    this.target = target;
    this.moduleId = moduleId;
    this.isRouteConfig = false;
    this.isConfigureRouter = false;
    this.routeConfigModuleIds = [];
    this.enableEagerLoading = false;
    this.enableStaticAnalysis = false;
    this.createRouteConfigInstruction = null;
    this.ownRoutes = [];
    this.childRoutes = [];
    this.filterChildRoutes = null;
    this.areChildRoutesLoaded = false;
    this.areOwnRoutesLoaded = false;
    this.isConfiguringRouter = false;
    this.isRouterConfigured = false;
    this.parents = new Set<RouterResource>();
    this.router = null;
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
   * If there is a `routeConfigModuleIds` property present on the instruction,
   * or the target has a `configureRouter()` method, it will be initialized as `configureRouter`, otherwise as `routeConfig`
   * @param instruction Instruction containing the parameters passed to the `@configureRouter` decorator
   */
  public initialize(instruction?: IRouteConfigInstruction | IConfigureRouterInstruction | null): void {
    if (!instruction) {
      if (this.isRouteConfig && this.isConfigureRouter) {
        return; // already configured
      }
      // We're not being called from a decorator, so just apply defaults as if we're a @routeConfig
      // tslint:disable-next-line:no-parameter-reassignment
      instruction = this.ensureCreateRouteConfigInstruction();
    }
    const settings = this.getSettings(instruction);
    const target = instruction.target;
    if (isConfigureRouterInstruction(instruction)) {
      if (this.isConfigureRouter) {
        const moduleIds = (instruction as IConfigureRouterInstruction).routeConfigModuleIds;
        if (moduleIds && moduleIds.length) {
          for (const moduleId of moduleIds) {
            if (this.routeConfigModuleIds.indexOf(moduleId) === -1) {
              this.routeConfigModuleIds.push(moduleId);
            }
          }
        }

        return; // already configured
      }
      logger.debug(`initializing @configureRouter for ${target.name}`);

      this.isConfigureRouter = true;
      const configureInstruction = instruction as IConfigureRouterInstruction;

      this.routeConfigModuleIds = ensureArray(configureInstruction.routeConfigModuleIds);
      this.filterChildRoutes = settings.filterChildRoutes;
      this.enableEagerLoading = settings.enableEagerLoading;
      this.enableStaticAnalysis = settings.enableStaticAnalysis;

      assignOrProxyPrototypeProperty(
        target.prototype,
        "configureRouter",
        RouterResource.originalConfigureRouterSymbol,
        configureRouter
      );
    } else {
      if (this.isRouteConfig) {
        return; // already configured
      }
      logger.debug(`initializing @routeConfig for ${target.name}`);

      this.isRouteConfig = true;
      const configInstruction = instruction as IRouteConfigInstruction;

      this.createRouteConfigInstruction = { ...configInstruction, settings };
    }
  }

  /**
   * Ensures that the module for this resources is loaded and registered so that its routing information can be queried.
   */
  public async load(): Promise<void> {
    const registry = this.getRegistry();
    const loader = this.getResourceLoader();
    if (!this.moduleId) {
      this.moduleId = registry.registerModuleViaConstructor(this.target).moduleId;
    }
    await loader.loadRouterResource(this.moduleId);
  }

  public async loadOwnRoutes(): Promise<ICompleteRouteConfig[]> {
    if (this.areOwnRoutesLoaded) {
      return this.ownRoutes;
    }

    // If we're in this method then it can never be the root, so it's always safe to apply @routeConfig initialization
    if (!this.isRouteConfig) {
      this.isRouteConfig = true;
      this.initialize();
    }

    const instruction = this.ensureCreateRouteConfigInstruction();
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
    this.router = router !== undefined ? router : null;
    if (this.areChildRoutesLoaded) {
      return this.childRoutes;
    }

    logger.debug(`loading childRoutes for ${this.target.name}`);

    const loader = this.getResourceLoader();

    let extractedChildRoutes: ICompleteRouteConfig[] | undefined;
    if (this.enableStaticAnalysis) {
      extractedChildRoutes = await this.getConfigFactory().createChildRouteConfigs({ target: this.target } as any);
      for (const extracted of extractedChildRoutes) {
        if (extracted.moduleId) {
          if (this.routeConfigModuleIds.indexOf(extracted.moduleId) === -1) {
            this.routeConfigModuleIds.push(extracted.moduleId);
          }
          await loader.loadRouterResource(extracted.moduleId);
        }
      }
    }

    for (const moduleId of this.routeConfigModuleIds) {
      const resource = await loader.loadRouterResource(moduleId);
      const childRoutes = await resource.loadOwnRoutes();
      resource.parents.add(this);
      if (resource.isConfigureRouter && this.enableEagerLoading) {
        await resource.loadChildRoutes();
      }
      const childRoutesToProcess: ICompleteRouteConfig[] = [];
      if (this.enableStaticAnalysis) {
        const couples = alignRouteConfigs(childRoutes, extractedChildRoutes as any);
        for (const couple of couples) {
          if (couple.left) {
            const childRoute = couple.left as ICompleteRouteConfig;
            if (couple.right) {
              Object.assign(childRoute, {
                ...couple.right,
                settings: { ...childRoute.settings, ...couple.right.settings }
              });
            }
            childRoutesToProcess.push(childRoute);
          }
        }
      } else {
        childRoutesToProcess.push(...childRoutes);
      }

      for (const childRoute of childRoutesToProcess) {
        if (!this.filterChildRoutes || (await this.filterChildRoutes(childRoute, childRoutes, this))) {
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
  public async configureRouter(config: RouterConfiguration, router: Router, ...args: any[]): Promise<void> {
    await this.load();

    const viewModel = (router.container as any).viewModel;
    const settings = this.getSettings();

    if (typeof settings.onBeforeLoadChildRoutes === "function") {
      await settings.onBeforeLoadChildRoutes(viewModel, config, router, this, ...args);
    }

    this.isConfiguringRouter = true;
    const routes = await this.loadChildRoutes();
    assignPaths(routes);

    if (typeof settings.onBeforeConfigMap === "function") {
      await settings.onBeforeConfigMap(viewModel, config, router, this, routes, ...args);
    }

    config.map(routes);
    this.router = router;
    if (router instanceof AppRouter || router.isRoot) {
      const assign = settings.assignRouterToViewModel;
      if (assign === true) {
        viewModel.router = router;
      } else if (Object.prototype.toString.call(assign) === "[object String]") {
        viewModel[assign as string] = router;
      } else if (typeof assign === "function") {
        await assign(viewModel, config, router, this, routes, ...args);
      }

      const settingsConfig = this.getSettings().routerConfiguration || ({} as any);
      mergeRouterConfiguration(config, settingsConfig);

      if (typeof settings.onAfterMergeRouterConfiguration === "function") {
        await settings.onAfterMergeRouterConfiguration(viewModel, config, router, this, routes, ...args);
      }
    }

    this.isRouterConfigured = true;
    this.isConfiguringRouter = false;

    const originalConfigureRouter = this.target.prototype[
      RouterResource.originalConfigureRouterSymbol
    ] as ConfigureRouter;
    if (originalConfigureRouter !== undefined) {
      if (this.enableStaticAnalysis) {
        Object.defineProperty(config, RouterResource.routerResourceSymbol, {
          enumerable: false,
          configurable: true,
          writable: true,
          value: this
        });
        Object.defineProperty(config, RouterResource.originalMapSymbol, {
          enumerable: false,
          configurable: true,
          writable: true,
          value: config.map
        });
        Object.defineProperty(config, "map", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: map.bind(config)
        });
      }

      return originalConfigureRouter.call(viewModel, config, router);
    }
  }

  protected ensureCreateRouteConfigInstruction(): ICreateRouteConfigInstruction {
    const instruction = this.createRouteConfigInstruction || (this.createRouteConfigInstruction = {} as any);
    instruction.target = instruction.target || this.target;
    instruction.moduleId = instruction.moduleId || this.moduleId;
    instruction.settings = instruction.settings || this.getSettings(instruction);

    return instruction;
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

  protected getRegistry(): Registry {
    return RouterMetadataConfiguration.INSTANCE.getRegistry(this.container);
  }
}

function isConfigureRouterInstruction(instruction: IRouteConfigInstruction | IConfigureRouterInstruction): boolean {
  return (
    !!(instruction as IConfigureRouterInstruction).routeConfigModuleIds ||
    Object.prototype.hasOwnProperty.call(instruction.target.prototype, "configureRouter")
  );
}

function ensureArray<T>(value: T | undefined | T[]): T[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function assignPaths(routes: ICompleteRouteConfig[]): void {
  for (const route of routes.filter((r: ICompleteRouteConfig) => !r.settings.path)) {
    const parentPath = route.settings.parentRoute ? route.settings.parentRoute.settings.path : "";
    const pathProperty = route.settings.pathProperty || "route";
    const path = route[pathProperty];
    route.settings.path = `${parentPath}/${path}`.replace(/\/\//g, "/").replace(/^\//, "");

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
    Object.defineProperty(proto, refSymbol, { enumerable: false, configurable: true, writable: true, value: original });
  }
  proto[name] = value;
}

// tslint:disable:no-invalid-this
async function configureRouter(this: any, config: RouterConfiguration, router: Router, ...args: any[]): Promise<void> {
  const target = Object.getPrototypeOf(this).constructor as IRouterResourceTarget;
  const resource = routerMetadata.getOwn(target);
  await resource.configureRouter(config, router, ...args);
}
// tslint:enable:no-invalid-this

function map(this: any, originalConfigs: RouteConfig | RouteConfig[]): RouterConfiguration {
  Object.defineProperty(this, "map", {
    enumerable: false,
    configurable: true,
    writable: true,
    value: this[RouterResource.originalMapSymbol].bind(this)
  });
  delete this[RouterResource.originalMapSymbol];
  const resource = this[RouterResource.routerResourceSymbol] as RouterResource;
  delete this[RouterResource.routerResourceSymbol];
  const splittedOriginalConfigs = splitRouteConfig(ensureArray(originalConfigs));
  const couples = alignRouteConfigs(resource.childRoutes, splittedOriginalConfigs);
  const remainingConfigs: RouteConfig[] = [];
  for (const couple of couples) {
    if (couple.left && couple.right) {
      Object.assign(couple.left, {
        ...couple.right,
        settings: { ...couple.left.settings, ...couple.right.settings }
      });
    } else if (couple.right) {
      remainingConfigs.push(couple.right as any);
    }
  }

  // tslint:disable-next-line:no-parameter-reassignment
  originalConfigs = remainingConfigs;

  if (originalConfigs.length > 0) {
    this.map(originalConfigs);
  }

  return this;
}

function mergeRouterConfiguration(target: RouterConfiguration, source: IRouterConfiguration): RouterConfiguration {
  target.instructions = (target.instructions || []).concat(source.instructions || []);
  target.options = { ...(target.options || {}), ...(source.options || {}) };
  target.pipelineSteps = (target.pipelineSteps || []).concat((source.pipelineSteps as any) || []);
  target.title = source.title as string;
  target.unknownRouteConfig = source.unknownRouteConfig;
  target.viewPortDefaults = { ...(target.viewPortDefaults || {}), ...(source.viewPortDefaults || {}) };

  return target;
}

interface IRouteConfigCouple {
  left?: IRouteConfig;
  right?: IRouteConfig;
}

function alignRouteConfigs(leftList: IRouteConfig[], rightList: IRouteConfig[]): IRouteConfigCouple[] {
  // we're essentially doing an OUTER JOIN here
  const couples: IRouteConfigCouple[] = leftList.map(left => {
    const couple: IRouteConfigCouple = {
      left
    };
    let rightMatches = rightList.filter(r => r.moduleId === left.moduleId);
    if (rightMatches.length > 1) {
      rightMatches = rightMatches.filter(r => r.route === left.route);
      if (rightMatches.length > 1) {
        rightMatches = rightMatches.filter(r => r.name === left.name);
        if (rightMatches.length > 1) {
          rightMatches = rightMatches.filter(r => r.href === left.href);
        }
      }
    }
    if (rightMatches.length > 1) {
      // really shouldn't be possible
      throw new Error(`Probable duplicate routes found: ${JSON.stringify(rightMatches)}`);
    }
    if (rightMatches.length === 1) {
      couple.right = rightMatches[0];
    }

    return couple;
  });
  for (const right of rightList) {
    if (!couples.some(c => c.right === right)) {
      couples.push({ right });
    }
  }

  return couples;
}
