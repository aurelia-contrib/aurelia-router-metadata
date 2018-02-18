import { RouteConfig } from "aurelia-router";
import { IMapRoutablesInstruction, IRoutableResourceTarget } from "./interfaces";
import { RoutableResource } from "./routable-resource";

/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param routableModuleIds A single or array of `PLATFORM.moduleName("")`
 * @param eagerLoadChildRoutes Whether the routes' childRoutes should also be mapped during `configureRouter`
 * @param filter A filter to determine which routes to map
 */
export function mapRoutables(
  routableModuleIds: string | string[],
  eagerLoadChildRoutes: boolean = false,
  filter?: (route: RouteConfig) => boolean
): ClassDecorator {
  return (target: IRoutableResourceTarget): void => {
    const instruction: IMapRoutablesInstruction = { target, routableModuleIds, eagerLoadChildRoutes, filter };
    RoutableResource.MAP_ROUTABLES(instruction);
  };
}
