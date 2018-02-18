import { RoutableResource } from "./routable-resource";
/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param routableModuleIds A single or array of `PLATFORM.moduleName("")`
 * @param eagerLoadChildRoutes Whether the routes' childRoutes should also be mapped during `configureRouter`
 * @param filter A filter to determine which routes to map
 */
export function mapRoutables(routableModuleIds, eagerLoadChildRoutes = false, filter) {
    return (target) => {
        const instruction = { target, routableModuleIds, eagerLoadChildRoutes, filter };
        RoutableResource.MAP_ROUTABLES(instruction);
    };
}
//# sourceMappingURL=map-routables.js.map