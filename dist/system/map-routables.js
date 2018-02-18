System.register(["./routable-resource"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
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
    exports_1("mapRoutables", mapRoutables);
    var routable_resource_1;
    return {
        setters: [
            function (routable_resource_1_1) {
                routable_resource_1 = routable_resource_1_1;
            }
        ],
        execute: function () {
        }
    };
});
//# sourceMappingURL=map-routables.js.map