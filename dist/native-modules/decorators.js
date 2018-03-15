import { RouterResource } from "./router-resource";
/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routesOrInstruction One or more RouteConfig objects whose properties will override the convention defaults,
 * or an instruction object containing this decorators' parameters as properties
 * @param overrideSettings A settings object to override the global RouterMetadataSettings for this resource
 */
export function routeConfig(routesOrInstruction, overrideSettings) {
    return (target) => {
        let instruction;
        if (Object.prototype.toString.call(routesOrInstruction) === "[object Object]" &&
            routesOrInstruction.target) {
            instruction = routesOrInstruction;
        }
        else {
            instruction = {
                target,
                routes: routesOrInstruction,
                settings: overrideSettings
            };
        }
        RouterResource.ROUTE_CONFIG(instruction);
    };
}
/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param routeConfigModuleIdsOrInstruction A single or array of `PLATFORM.moduleName("")`,
 * or an instruction object containing this decorators' parameters as properties
 * @param overrideSettings A settings object to override the global RouterMetadataSettings for this resource
 */
export function configureRouter(routeConfigModuleIdsOrInstruction, overrideSettings) {
    return (target) => {
        let instruction;
        if (Object.prototype.toString.call(routeConfigModuleIdsOrInstruction) === "[object Object]" &&
            routeConfigModuleIdsOrInstruction.target) {
            instruction = routeConfigModuleIdsOrInstruction;
        }
        else {
            instruction = {
                target,
                routeConfigModuleIds: routeConfigModuleIdsOrInstruction,
                settings: overrideSettings
            };
        }
        RouterResource.CONFIGURE_ROUTER(instruction);
    };
}
