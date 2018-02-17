import { Container } from "aurelia-dependency-injection";
import { Loader } from "aurelia-loader";
import { metadata } from "aurelia-metadata";
import { RouteConfig, Router, RouterConfiguration } from "aurelia-router";
import { RoutableResource } from "./routable-resource";
import { getModuleId } from "./utils";

const configureRouterSymbol = Symbol("configureRouter") as any as string;
const metadataKey = RoutableResource.routableResourceMetadataKey;
type ConfigureRouter = (config: RouterConfiguration, router: Router) => Promise<void> | PromiseLike<void> | void;

/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param moduleId A single or array of `PLATFORM.moduleName("")`
 * @param eagerLoadChildRoutes Whether the routes' childRoutes should also be mapped during `configureRouter`
 * @param filter A filter to determine which routes to map
 */
export function mapRoutables(
  moduleId: string | string[],
  eagerLoadChildRoutes: boolean = false,
  filter?: (route: RouteConfig) => boolean
): ClassDecorator {
  return (target: any): any => {
    const ownModuleId: string = getModuleId(target);
    RoutableResource.setTarget(ownModuleId, target);

    const resource = metadata.getOrCreateOwn(metadataKey, RoutableResource, target) as any as RoutableResource;

    const loadChildRoutes = async (): Promise<RouteConfig[]> => {
      if (Array.isArray(resource.childRoutes)) {
        return resource.childRoutes;
      }

      const filterRoute = (typeof filter === "function" ? filter : (): boolean => true) as Function;
      const moduleIds = Array.isArray(moduleId) ? moduleId : [moduleId];
      const loader = Container.instance.get(Loader) as Loader;

      await loader.loadAllModules(moduleIds);

      const routes = [] as RouteConfig[];
      for (const id of moduleIds) {
        const trg = RoutableResource.getTarget(id) as Function;
        if (trg === undefined) {
          throw new Error(`Unable to resolve routable for module '${id}' (requested by: '${ownModuleId}').
            Routes registered through @mapRoutables must have a corresponding @routable on the referenced component.`);
        }
        const res = metadata.getOwn(metadataKey, trg) as any as RoutableResource;
        for (const route of res.routes) {
          if (filterRoute(route)) {
            routes.push(route);
          }
        }
        if (eagerLoadChildRoutes && res.loadChildRoutes !== undefined) {
          const childRoutes = await res.loadChildRoutes();
          for (const route of routes) {
            route.settings.childRoutes = childRoutes;
          }
        }
      }

      resource.childRoutes = routes;

      return routes;
    };

    resource.moduleId = ownModuleId;
    resource.loadChildRoutes = loadChildRoutes;

    if ("configureRouter" in target.prototype) {
      const originalConfigureRouter = target.prototype.configureRouter as ConfigureRouter;
      target.prototype[configureRouterSymbol] = originalConfigureRouter;
    }
    target.prototype.configureRouter = configureRouter;
  };
}

async function configureRouter(config: RouterConfiguration, router: Router): Promise<void> {
  // tslint:disable-next-line
  const context = this;
  const target = context.constructor as Function;
  const resource = metadata.getOwn(metadataKey, target) as any as RoutableResource;
  const routes = await resource.loadChildRoutes() as RouteConfig[];
  config.map(routes);

  const originalConfigureRouter = context[configureRouterSymbol] as ConfigureRouter;
  if (originalConfigureRouter !== undefined) {
    return originalConfigureRouter.call(context, config, router);
  }
}
