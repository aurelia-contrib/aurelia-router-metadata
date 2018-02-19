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
  public moduleId: string;
  public target: IRoutableResourceTarget;

  public isRoutable: boolean;
  public isMapRoutables: boolean;

  public routableModuleIds: string[];
  public enableEagerLoading: boolean;
  public ownRoutes: RouteConfig[];
  public childRoutes: RouteConfig[];
  public filterChildRoutes: (
    config: RouteConfig,
    allConfigs: RouteConfig[],
    mapInstruction: IMapRoutablesInstruction
  ) => boolean;
  public transformRouteConfigs: (configs: RouteConfig[], configInstruction: IRouteConfigInstruction) => RouteConfig[];
  public areChildRoutesLoaded: boolean;
  public areChildRouteModulesLoaded: boolean;
  public isConfiguringRouter: boolean;
  public isRouterConfigured: boolean;
  public parent: RoutableResource;
  public router: Router;
  public get container(): Container {
    return this.router ? this.router.container : (null as any);
  }
  public get instance(): IRoutableResourceTargetProto {
    return this.container ? (this.container as any).viewModel : null;
  }
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
    this.transformRouteConfigs = null as any;
    this.areChildRoutesLoaded = false;
    this.areChildRouteModulesLoaded = false;
    this.isConfiguringRouter = false;
    this.isRouterConfigured = false;
    this.parent = null as any;
    this.router = null as any;
  }

  public static ROUTABLE(instruction: IRoutableInstruction, existing?: RoutableResource): RoutableResource {
    const resource = existing || routerMetadata.getOrCreateOwn(instruction.target);
    resource.initialize(instruction);

    return resource;
  }

  public static MAP_ROUTABLES(instruction: IMapRoutablesInstruction, existing?: RoutableResource): RoutableResource {
    const resource = existing || routerMetadata.getOrCreateOwn(instruction.target);
    resource.initialize(instruction);

    return resource;
  }

  public initialize(instruction: IRoutableInstruction | IMapRoutablesInstruction): void {
    const settings = this.getSettings(instruction);
    const moduleId = this.moduleId;
    const target = instruction.target;
    if (isMapRoutablesInstruction(instruction)) {
      logger.debug(`initializing @mapRoutables for ${moduleId}`);

      this.isMapRoutables = true;
      this.routableModuleIds = ensureArray((instruction as IMapRoutablesInstruction).routableModuleIds);
      this.filterChildRoutes = settings.filterChildRoutes;
      this.enableEagerLoading = settings.enableEagerLoading;

      assignOrProxyPrototypeProperty(target.prototype, "configureRouter", configureRouterSymbol, configureRouter);
    } else {
      logger.debug(`initializing @routable for ${this.moduleId}`);

      this.isRoutable = true;
      this.transformRouteConfigs = settings.transformRouteConfigs;

      const configInstruction = { ...instruction, moduleId, settings };
      const configs = this.getConfigFactory().createRouteConfigs(configInstruction);
      for (const config of configs) {
        config.settings.routableResource = this;
        this.ownRoutes.push(config);
      }
    }
  }

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
