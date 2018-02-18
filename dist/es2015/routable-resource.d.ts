import { RouteConfig, Router, RouterConfiguration } from "aurelia-router";
import { IMapRoutablesInstruction, IRoutableInstruction, IRoutableResourceTarget, IRoutableResourceTargetProto } from "./interfaces";
/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
export declare class RoutableResource {
    ownModuleId: string;
    ownTarget: IRoutableResourceTargetProto;
    isRoutable: boolean;
    isMapRoutables: boolean;
    routableModuleIds: string[];
    enableEagerLoading: boolean;
    ownRoutes: RouteConfig[];
    childRoutes: RouteConfig[];
    filterChildRoutes: (route: RouteConfig) => boolean;
    areChildRoutesLoaded: boolean;
    areChildRouteModulesLoaded: boolean;
    isRouterConfigured: boolean;
    router: Router;
    readonly instance: IRoutableResourceTarget;
    constructor(moduleId: string, target: Function);
    static ROUTABLE(instruction: IRoutableInstruction, existing?: RoutableResource): RoutableResource;
    static MAP_ROUTABLES(instruction: IMapRoutablesInstruction, existing?: RoutableResource): RoutableResource;
    loadChildRoutes(): Promise<RouteConfig[]>;
    loadChildRouteModules(): Promise<void>;
    configureRouter(config: RouterConfiguration, router: Router): Promise<void>;
}
