import { IConfigureRouterInstruction, IRouteConfig, IRouteConfigInstruction } from "./interfaces";
import { RouterMetadataSettings } from "./router-metadata-configuration";
/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routesOrInstruction One or more RouteConfig objects whose properties will override the convention defaults,
 * or an instruction object containing this decorators' parameters as properties
 * @param overrideSettings A settings object to override the global RouterMetadataSettings for this resource
 */
export declare function routeConfig(routesOrInstruction?: (IRouteConfig | IRouteConfig[]) | IRouteConfigInstruction, overrideSettings?: RouterMetadataSettings): ClassDecorator;
/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param routeConfigModuleIdsOrInstruction A single or array of `PLATFORM.moduleName("")`,
 * or an instruction object containing this decorators' parameters as properties
 * @param overrideSettings A settings object to override the global RouterMetadataSettings for this resource
 */
export declare function configureRouter(routeConfigModuleIdsOrInstruction: (string | string[]) | IConfigureRouterInstruction, overrideSettings?: RouterMetadataSettings): ClassDecorator;
