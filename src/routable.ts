import { RouteConfig } from "aurelia-router";
import { IRoutableInstruction, IRoutableResourceTarget } from "./interfaces";
import { RoutableResource } from "./routable-resource";

/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routes One or more RouteConfig objects whose properties will override the convention defaults
 * @param baseRoute A RouteConfig object whose properties will override the convention defaults, but will be overridden by routes
 */
export function routable(routes?: RouteConfig | RouteConfig[], baseRoute?: RouteConfig): ClassDecorator {
  return (target: IRoutableResourceTarget): void => {
    const instruction: IRoutableInstruction = { target, routes, baseRoute };
    RoutableResource.ROUTABLE(instruction);
  };
}
