"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routable_resource_1 = require("./routable-resource");
/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routes One or more RouteConfig objects whose properties will override the convention defaults
 * @param baseRoute A RouteConfig object whose properties will override the convention defaults, but will be overridden by routes
 */
function routable(routes, baseRoute) {
    return (target) => {
        const instruction = { target, routes, baseRoute };
        routable_resource_1.RoutableResource.ROUTABLE(instruction);
    };
}
exports.routable = routable;
//# sourceMappingURL=routable.js.map