System.register(["./routable-resource"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    /**
     * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
     * @param routesOrInstruction One or more RouteConfig objects whose properties will override the convention defaults,
     * or an instruction object containing this decorators' parameters as properties
     * @param baseRoute A RouteConfig object whose properties will override the convention defaults, but will be overridden by routes
     * @param transformRouteConfigs Perform any final modifications on the routes just before they are stored in the metadata
     */
    function routable(routesOrInstruction, baseRoute, transformRouteConfigs) {
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