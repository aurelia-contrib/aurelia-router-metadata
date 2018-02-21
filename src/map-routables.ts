import { RouteConfig } from "aurelia-router";
import { IMapRoutablesInstruction, IRoutableResourceTarget } from "./interfaces";
import { RoutableResource } from "./routable-resource";

/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param routableModuleIdsOrInstruction A single or array of `PLATFORM.moduleName("")`,
 * or an instruction object containing this decorators' parameters as properties
 * @param enableEagerLoading Whether the routes' childRoutes should also be mapped during `configureRouter`
 * @param filterChildRoutes A filter to determine which routes to map
 */
export function mapRoutables(
  routableModuleIdsOrInstruction: (string | string[]) | IMapRoutablesInstruction,
  enableEagerLoading?: boolean,
  filterChildRoutes?: (
    config: RouteConfig,
    allConfigs: RouteConfig[],
    mapInstruction: IMapRoutablesInstruction
  ) => boolean
): ClassDecorator {
  return (target: IRoutableResourceTarget): void => {
    let instruction: IMapRoutablesInstruction;
    if (
      Object.prototype.toString.call(routableModuleIdsOrInstruction) === "[object Object]" &&
      (routableModuleIdsOrInstruction as any).target
    ) {
      instruction = routableModuleIdsOrInstruction as IMapRoutablesInstruction;
    } else {
      instruction = {
        target,
        routableModuleIds: routableModuleIdsOrInstruction as string | string[],
        enableEagerLoading,
        filterChildRoutes
      };
    }
    RoutableResource.MAP_ROUTABLES(instruction);
  };
}
