import { RoutableResource } from "./routable-resource";
/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param routableModuleIdsOrInstruction A single or array of `PLATFORM.moduleName("")`,
 * or an instruction object containing this decorators' parameters as properties
 * @param enableEagerLoading Whether the routes' childRoutes should also be mapped during `configureRouter`
 * @param filterChildRoutes A filter to determine which routes to map
 */
export function mapRoutables(routableModuleIdsOrInstruction, enableEagerLoading, filterChildRoutes) {
    return (target) => {
        let instruction;
        if (Object.prototype.toString.call(routableModuleIdsOrInstruction) === "[object Object]" &&
            routableModuleIdsOrInstruction.target) {
            instruction = routableModuleIdsOrInstruction;
        }
        else {
            instruction = {
                target,
                routableModuleIds: routableModuleIdsOrInstruction,
                enableEagerLoading,
                filterChildRoutes
            };
        }
        RoutableResource.MAP_ROUTABLES(instruction);
    };
}
//# sourceMappingURL=map-routables.js.map