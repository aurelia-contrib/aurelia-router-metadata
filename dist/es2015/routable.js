import { RoutableResource } from "./routable-resource";
/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routesOrInstruction One or more RouteConfig objects whose properties will override the convention defaults,
 * or an instruction object containing this decorators' parameters as properties
 * @param baseRoute A RouteConfig object whose properties will override the convention defaults, but will be overridden by routes
 * @param transformRouteConfigs Perform any final modifications on the routes just before they are stored in the metadata
 */
export function routable(routesOrInstruction, baseRoute, transformRouteConfigs) {
    return (target) => {
        let instruction;
        if (Object.prototype.toString.call(routesOrInstruction) === "[object Object]" && routesOrInstruction.target) {
            instruction = routesOrInstruction;
        }
        else {
            instruction = {
                target,
                routes: routesOrInstruction,
                baseRoute,
                transformRouteConfigs
            };
        }
        RoutableResource.ROUTABLE(instruction);
    };
}
//# sourceMappingURL=routable.js.map