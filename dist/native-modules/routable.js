import { RoutableResource } from "./routable-resource";
/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routes One or more RouteConfig objects whose properties will override the convention defaults
 * @param baseRoute A RouteConfig object whose properties will override the convention defaults, but will be overridden by routes
 */
export function routable(routes, baseRoute) {
    return (target) => {
        const instruction = { target, routes, baseRoute };
        RoutableResource.ROUTABLE(instruction);
    };
}
//# sourceMappingURL=routable.js.map