import { RouteConfig } from "aurelia-router";
import { IRoutableInstruction, IRoutableResourceTarget, IRouteConfigInstruction } from "./interfaces";
import { RoutableResource } from "./routable-resource";

/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routesOrInstruction One or more RouteConfig objects whose properties will override the convention defaults,
 * or an instruction object containing this decorators' parameters as properties
 * @param baseRoute A RouteConfig object whose properties will override the convention defaults, but will be overridden by routes
 * @param transformRouteConfigs Perform any final modifications on the routes just before they are stored in the metadata
 */
export function routable(
  routesOrInstruction?: (RouteConfig | RouteConfig[]) | IRoutableInstruction,
  baseRoute?: RouteConfig,
  transformRouteConfigs?: (configs: RouteConfig[], configInstruction: IRouteConfigInstruction) => RouteConfig[]
): ClassDecorator {
  return (target: IRoutableResourceTarget): void => {
    let instruction: IRoutableInstruction;
    if (Object.prototype.toString.call(routesOrInstruction) === "[object Object]") {
      instruction = routesOrInstruction as IRoutableInstruction;
    } else {
      instruction = {
        target,
        routes: routesOrInstruction as RouteConfig | RouteConfig[],
        baseRoute,
        transformRouteConfigs
      };
    }
    RoutableResource.ROUTABLE(instruction);
  };
}
