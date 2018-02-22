import { RouteConfig } from "aurelia-router";
import {
  IConfigureRouterInstruction,
  ICreateRouteConfigInstruction,
  IRouteConfigInstruction,
  IRouterResourceTarget
} from "./interfaces";
import { RouterResource } from "./router-resource";

/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routesOrInstruction One or more RouteConfig objects whose properties will override the convention defaults,
 * or an instruction object containing this decorators' parameters as properties
 * @param baseRoute A RouteConfig object whose properties will override the convention defaults, but will be overridden by routes
 * @param transformRouteConfigs Perform any final modifications on the routes just before they are stored in the metadata
 */
export function routeConfig(
  routesOrInstruction?: (RouteConfig | RouteConfig[]) | IRouteConfigInstruction,
  baseRoute?: RouteConfig,
  transformRouteConfigs?: (configs: RouteConfig[], configInstruction: ICreateRouteConfigInstruction) => RouteConfig[]
): ClassDecorator {
  return (target: IRouterResourceTarget): void => {
    let instruction: IRouteConfigInstruction;
    if (
      Object.prototype.toString.call(routesOrInstruction) === "[object Object]" &&
      (routesOrInstruction as any).target
    ) {
      instruction = routesOrInstruction as IRouteConfigInstruction;
    } else {
      instruction = {
        target,
        routes: routesOrInstruction as RouteConfig | RouteConfig[],
        baseRoute,
        transformRouteConfigs
      };
    }
    RouterResource.ROUTE_CONFIG(instruction);
  };
}

/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param routeConfigModuleIdsOrInstruction A single or array of `PLATFORM.moduleName("")`,
 * or an instruction object containing this decorators' parameters as properties
 * @param enableEagerLoading Whether the routes' childRoutes should also be mapped during `configureRouter`
 * @param filterChildRoutes A filter to determine which routes to map
 */
export function configureRouter(
  routeConfigModuleIdsOrInstruction: (string | string[]) | IConfigureRouterInstruction,
  enableEagerLoading?: boolean,
  filterChildRoutes?: (
    config: RouteConfig,
    allConfigs: RouteConfig[],
    configureInstruction: IConfigureRouterInstruction
  ) => boolean
): ClassDecorator {
  return (target: IRouterResourceTarget): void => {
    let instruction: IConfigureRouterInstruction;
    if (
      Object.prototype.toString.call(routeConfigModuleIdsOrInstruction) === "[object Object]" &&
      (routeConfigModuleIdsOrInstruction as any).target
    ) {
      instruction = routeConfigModuleIdsOrInstruction as IConfigureRouterInstruction;
    } else {
      instruction = {
        target,
        routeConfigModuleIds: routeConfigModuleIdsOrInstruction as string | string[],
        enableEagerLoading,
        filterChildRoutes
      };
    }
    RouterResource.CONFIGURE_ROUTER(instruction);
  };
}
