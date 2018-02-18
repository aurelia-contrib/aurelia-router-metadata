import { RouteConfig } from "aurelia-router";
/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param routableModuleIds A single or array of `PLATFORM.moduleName("")`
 * @param eagerLoadChildRoutes Whether the routes' childRoutes should also be mapped during `configureRouter`
 * @param filter A filter to determine which routes to map
 */
export declare function mapRoutables(routableModuleIds: string | string[], eagerLoadChildRoutes?: boolean, filter?: (route: RouteConfig) => boolean): ClassDecorator;
