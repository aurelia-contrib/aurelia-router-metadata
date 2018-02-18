"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routable_resource_1 = require("./routable-resource");
/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param routableModuleIds A single or array of `PLATFORM.moduleName("")`
 * @param eagerLoadChildRoutes Whether the routes' childRoutes should also be mapped during `configureRouter`
 * @param filter A filter to determine which routes to map
 */
function mapRoutables(routableModuleIds, eagerLoadChildRoutes = false, filter) {
    return (target) => {
        const instruction = { target, routableModuleIds, eagerLoadChildRoutes, filter };
        routable_resource_1.RoutableResource.MAP_ROUTABLES(instruction);
    };
}
exports.mapRoutables = mapRoutables;
//# sourceMappingURL=map-routables.js.map