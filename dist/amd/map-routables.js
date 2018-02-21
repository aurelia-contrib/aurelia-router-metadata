define(["require", "exports", "./routable-resource"], function (require, exports, routable_resource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
     * @param routableModuleIdsOrInstruction A single or array of `PLATFORM.moduleName("")`,
     * or an instruction object containing this decorators' parameters as properties
     * @param enableEagerLoading Whether the routes' childRoutes should also be mapped during `configureRouter`
     * @param filterChildRoutes A filter to determine which routes to map
     */
    function mapRoutables(routableModuleIdsOrInstruction, enableEagerLoading, filterChildRoutes) {
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
            routable_resource_1.RoutableResource.MAP_ROUTABLES(instruction);
        };
    }
    exports.mapRoutables = mapRoutables;
});
//# sourceMappingURL=map-routables.js.map