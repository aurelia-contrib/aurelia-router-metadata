import { RouteConfig } from "aurelia-router";
/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routes One or more RouteConfig objects whose properties will override the convention defaults
 * @param baseRoute A RouteConfig object whose properties will override the convention defaults, but will be overridden by routes
 */
export declare function routable(routes?: RouteConfig | RouteConfig[], baseRoute?: RouteConfig): ClassDecorator;
