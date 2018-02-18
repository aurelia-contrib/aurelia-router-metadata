import { getLogger, Logger } from "aurelia-logging";
import { metadata } from "aurelia-metadata";
import { PLATFORM } from "aurelia-pal";
import { NavigationInstruction, NavModel, RouteConfig, Router, RouterConfiguration } from "aurelia-router";
import {
  IMapRoutablesInstruction,
  IRoutableInstruction,
  IRoutableResourceTarget,
  IRoutableResourceTargetProto
} from "./interfaces";
import { routerMetadata } from "./router-metadata";

const configureRouterSymbol = (Symbol("configureRouter") as any) as string;
type ConfigureRouter = (config: RouterConfiguration, router: Router) => Promise<void> | PromiseLike<void> | void;

const logger = getLogger("router-metadata") as Logger;
const routeConfigProperies: string[] = [
  "route",
  "moduleId",
  "redirect",
  "navigationStrategy",
  "viewPorts",
  "nav",
  "href",
  "generationUsesHref",
  "title",
  "settings",
  "navModel",
  "caseSensitive",
  "activationStrategy",
  "layoutView",
  "layoutViewModel",
  "layoutModel"
];

/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
export class RoutableResource {
  public ownModuleId: string;
  public ownTarget: IRoutableResourceTargetProto;

  public isRoutable: boolean;
  public isMapRoutables: boolean;

  public routableModuleIds: string[];
  public enableEagerLoading: boolean;
  public ownRoutes: RouteConfig[];
  public childRoutes: RouteConfig[];
  public filterChildRoutes: (route: RouteConfig) => boolean;
  public areChildRoutesLoaded: boolean;
  public areChildRouteModulesLoaded: boolean;
  public isRouterConfigured: boolean;
  public router: Router;
  public get instance(): IRoutableResourceTarget {
    return this.router ? (this.router.container as any).viewModel : null;
  }

  constructor(moduleId: string, target: Function) {
    this.ownModuleId = moduleId;
    this.ownTarget = target;
    this.isRoutable = false;
    this.isMapRoutables = false;
    this.routableModuleIds = [];
    this.enableEagerLoading = false;
    this.ownRoutes = [];
    this.childRoutes = [];
    this.filterChildRoutes = (): boolean => true;
    this.areChildRoutesLoaded = false;
    this.areChildRouteModulesLoaded = false;
    this.isRouterConfigured = false;
    this.router = null as any;
  }

  public static ROUTABLE(instruction: IRoutableInstruction, existing?: RoutableResource): RoutableResource {
    const { target, routes, baseRoute } = instruction;
    const resource = existing || routerMetadata.getOrCreateOwn(target);
    const moduleId = resource.ownModuleId;
    logger.debug(`initializing @routable for ${moduleId}`);

    resource.isRoutable = true;

    // convention defaults
    const hyphenated = getHyphenatedName(target);
    let defaults: RouteConfig = {
      route: hyphenated,
      name: hyphenated,
      title: target.name,
      nav: true,
      settings: {},
      moduleId: moduleId
    };

    // static property defaults
    defaults = { ...defaults, ...getRouteDefaults(target) };

    // argument defaults
    if (baseRoute) {
      defaults = { ...defaults, ...baseRoute };
    }

    const staticRoutes = target.routes;
    if (staticRoutes) {
      for (const route of Array.isArray(staticRoutes) ? staticRoutes : [staticRoutes]) {
        resource.ownRoutes.push({ ...defaults, ...route });
      }
    }
    if (routes) {
      for (const route of Array.isArray(routes) ? routes : [routes]) {
        resource.ownRoutes.push({ ...defaults, ...route });
      }
    }

    // if no routes defined, simply add one route with the default values
    if (resource.ownRoutes.length === 0) {
      resource.ownRoutes.push({ ...defaults });
    }

    for (const route of resource.ownRoutes) {
      route.settings.routableResource = resource;
    }

    return resource;
  }

  public static MAP_ROUTABLES(instruction: IMapRoutablesInstruction, existing?: RoutableResource): RoutableResource {
    const { target, routableModuleIds, eagerLoadChildRoutes, filter } = instruction;
    const resource = existing || routerMetadata.getOrCreateOwn(target);
    const moduleId = resource.ownModuleId;

    logger.debug(`initializing @routable for ${moduleId}`);

    resource.isMapRoutables = true;
    resource.routableModuleIds = Array.isArray(routableModuleIds) ? routableModuleIds : [routableModuleIds];
    resource.filterChildRoutes = filter || resource.filterChildRoutes;
    resource.enableEagerLoading = eagerLoadChildRoutes === true;

    const proto = target.prototype;

    if ("configureRouter" in proto) {
      let configureRouterProto = proto;
      while (!configureRouterProto.hasOwnProperty("configureRouter")) {
        configureRouterProto = Object.getPrototypeOf(configureRouterProto);
      }
      const originalConfigureRouter = configureRouterProto.configureRouter;
      proto[configureRouterSymbol] = originalConfigureRouter;
    }

    proto.configureRouter = configureRouter;

    return resource;
  }

  public async loadChildRoutes(): Promise<RouteConfig[]> {
    if (this.areChildRoutesLoaded) {
      return this.childRoutes;
    }

    logger.debug(`loading routes from child @routables for ${this.ownModuleId}`);

    await this.loadChildRouteModules();

    for (const moduleId of this.routableModuleIds) {
      const resource = routerMetadata.getOwn(moduleId);
      if (resource.isMapRoutables && this.enableEagerLoading) {
        await resource.loadChildRoutes();
      }
      for (const route of resource.ownRoutes.filter(this.filterChildRoutes)) {
        this.childRoutes.push(route);
      }
    }

    if (this.isRoutable) {
      for (const route of this.ownRoutes) {
        route.settings.childRoutes = this.childRoutes;
        for (const childRoute of this.childRoutes) {
          childRoute.settings.parentRoute = route;
        }
      }
    }
    this.areChildRoutesLoaded = true;

    return this.childRoutes;
  }

  public async loadChildRouteModules(): Promise<void> {
    if (this.areChildRouteModulesLoaded) {
      return;
    }

    await PLATFORM.Loader.loadAllModules(this.routableModuleIds);

    if (this.enableEagerLoading) {
      for (const moduleId of this.routableModuleIds) {
        const resource = routerMetadata.getOwn(moduleId);
        if (resource.isMapRoutables) {
          await resource.loadChildRouteModules();
        }
      }
    }
    this.areChildRouteModulesLoaded = true;
  }

  public async configureRouter(config: RouterConfiguration, router: Router): Promise<void> {
    const routes = await this.loadChildRoutes();
    config.map(routes);

    this.router = router;
    this.isRouterConfigured = true;

    const originalConfigureRouter = this.ownTarget.prototype[configureRouterSymbol] as ConfigureRouter;
    if (originalConfigureRouter !== undefined) {
      return originalConfigureRouter.call((router.container as any).viewModel, config, router);
    }
  }
}

// tslint:disable:no-invalid-this
async function configureRouter(config: RouterConfiguration, router: Router): Promise<void> {
  const target = Object.getPrototypeOf(this).constructor as IRoutableResourceTarget;
  const resource = routerMetadata.getOwn(target);
  await resource.configureRouter(config, router);
}
// tslint:enable:no-invalid-this

function getRouteDefaults(target: any): RouteConfig {
  // start with the first up in the prototype chain and override any properties we come across down the chain
  if (target === Function.prototype) {
    return {} as any;
  }
  const proto = Object.getPrototypeOf(target);
  let defaults = getRouteDefaults(proto);

  // first grab any static "RouteConfig-like" properties from the target
  for (const prop of routeConfigProperies) {
    if (target.hasOwnProperty(prop)) {
      defaults[prop] = target[prop];
    }
  }
  if (target.hasOwnProperty("routeName")) {
    defaults.name = target.routeName;
  }
  // then override them with any properties on the target's baseRoute property (if present)
  if (target.hasOwnProperty("baseRoute")) {
    defaults = { ...defaults, ...target.baseRoute };
  }

  return defaults;
}

function getHyphenatedName(target: Function): string {
  const name: string = target.name;

  return (name.charAt(0).toLowerCase() + name.slice(1)).replace(/([A-Z])/g, (char: string) => `-${char.toLowerCase()}`);
}
