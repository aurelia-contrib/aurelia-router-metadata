import { RouteConfig } from "aurelia-router";
import { IMapRoutablesInstruction } from "./interfaces";
/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param routableModuleIdsOrInstruction A single or array of `PLATFORM.moduleName("")`,
 * or an instruction object containing this decorators' parameters as properties
 * @param enableEagerLoading Whether the routes' childRoutes should also be mapped during `configureRouter`
 * @param filterChildRoutes A filter to determine which routes to map
 */
export declare function mapRoutables(routableModuleIdsOrInstruction: (string | string[]) | IMapRoutablesInstruction, enableEagerLoading?: boolean, filterChildRoutes?: (config: RouteConfig, allConfigs: RouteConfig[], mapInstruction: IMapRoutablesInstruction) => boolean): ClassDecorator;
