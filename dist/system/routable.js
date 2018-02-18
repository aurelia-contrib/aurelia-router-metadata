System.register(["./routable-resource"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
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
    exports_1("routable", routable);
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
//# sourceMappingURL=routable.js.map