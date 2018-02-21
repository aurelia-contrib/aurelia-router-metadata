import { Container } from "aurelia-dependency-injection";
import { RouteConfig, Router, RouterConfiguration } from "aurelia-router";
import { IMapRoutablesInstruction, IModuleLoader, IRoutableInstruction, IRoutableResourceTarget, IRoutableResourceTargetProto } from "./interfaces";
import { RouteConfigFactory } from "./route-config-factory";
import { RouterMetadataSettings } from "./router-metadata-settings";
/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
export declare class RoutableResource {
    /**
     * The moduleId (`PLATFORM.moduleName`) of the class this resource applies to
     */
    moduleId: string;
    /**
     * The target ("constructor Function") of the class this resource applies to
     */
    target: IRoutableResourceTarget;
    /**
     * True if this resource is a `@routable`
     */
    isRoutable: boolean;
    /**
     * True if this resource is a `@mapRoutables`
     */
    isMapRoutables: boolean;
    /**
     * Only applicable when `isMapRoutables`
     *
     * The moduleIds (`PLATFORM.moduleName`) of the routes that will be mapped on the target class' router
     */
    routableModuleIds: string[];
    /**
     * Only applicable when `isMapRoutables`
     *
     * If true: when `loadChildRoutes()`is called on this instance, it will also call `loadChildRoutes()` on the resources
     * associated with the `routableModuleIds` set on this instance (if they are also `@mapRoutables`)
     */
    enableEagerLoading: boolean;
    /**
     * Only applicable when `isRoutable`
     *
     * The `RouteConfig` objects with which the target's class is mapped in parent `@mapRoutables`
     */
    ownRoutes: RouteConfig[];
    /**
     * Only applicable when `isMapRoutables`
     *
     * The `RouteConfig` objects that will be mapped on the target class' router
     */
    childRoutes: RouteConfig[];
    /**
     * Only applicable when `isMapRoutables`
     *
     * Filter function to determine which `RouteConfig` objects to exclude from mapping on the target class' router
     */
    filterChildRoutes: (config: RouteConfig, allConfigs: RouteConfig[], mapInstruction: IMapRoutablesInstruction) => boolean;
    /**
     * Only applicable when `isMapRoutables`
     *
     * True if `loadChildRoutes()` has run on this instance
     */
    areChildRoutesLoaded: boolean;
    /**
     * Only applicable when `isMapRoutables`
     *
     * True if `loadChildRouteModules()` has run on this instance
     */
    areChildRouteModulesLoaded: boolean;
    /**
     * Only applicable when `isMapRoutables`
     *
     * True if `configureRouter()` was invoked on the target class, and we are currently still loading the child routes
     */
    isConfiguringRouter: boolean;
    /**
     * Only applicable when `isMapRoutables`
     *
     * True if `configureRouter()` has run on this instance and the childRoutes are mapped to the target class' router
     */
    isRouterConfigured: boolean;
    /**
     * The parent route
     */
    parent: RoutableResource;
    /**
     * Only applicable when `isMapRoutables`
     *
     * The router that was passed to the target class' `configureRouter()` method
     */
    router: Router;
    /**
     * Only applicable when `isMapRoutables`
     *
     * A convenience property which returns `router.container`, or `null` if the router is not set
     */
    readonly container: Container;
    /**
     * Only applicable when `isMapRoutables`
     *
     * A convenience property which returns `router.container.viewModel`, or `null` if the router is not set
     * This is an instance of the target class
     */
    readonly instance: IRoutableResourceTargetProto;
    /**
     * Returns a concatenation separated by '/' of the name of the first of `ownRoutes` of this instance,
     * together with the parents up to the root
     */
    readonly path: string;
    constructor(moduleId: string, target: Function);
    /**
     * Creates a `@routable` based on the provided instruction.
     *
     * This method is called by the `@routable()` decorator, and can be used instead of the @routable() decorator
     * to achieve the same effect.
     * @param instruction Instruction containing the parameters passed to the `@routable` decorator
     */
    static ROUTABLE(instruction: IRoutableInstruction): RoutableResource;
    /**
     * Creates a `@mapRoutables` based on the provided instruction.
     *
     * This method is called by the `@mapRoutables()` decorator, and can be used instead of the @mapRoutables() decorator
     * to achieve the same effect.
     * @param instruction Instruction containing the parameters passed to the `@mapRoutables` decorator
     */
    static MAP_ROUTABLES(instruction: IMapRoutablesInstruction): RoutableResource;
    /**
     * Initializes this resource based on the provided instruction.
     *
     * This method is called by the static `ROUTABLE` and `MAP_ROUTABLES` methods, and can be used instead of those
     * to achieve the same effect. If there is a `routableModuleIds` property present on the instruction, it will
     * be initialized as `@mapRoutables`, otherwise as `@routable`. To initialize a class as both, you'll need to call
     * this method twice with the appropriate instruction.
     * @param instruction Instruction containing the parameters passed to the `@mapRoutables` decorator
     */
    initialize(instruction: IRoutableInstruction | IMapRoutablesInstruction): void;
    /**
     * Retrieves the `RouteConfig` objects which were generated by all referenced moduleIds
     * and assigns them to `childRoutes`
     *
     * Will also call this method on child resources if `enableEagerLoading` is set to true.
     *
     * Will simply return the previously fetched `childRoutes` on subsequent calls.
     *
     * This method is called by `configureRouter()`.
     *
     * @param router (Optional) The router that was passed to the target instance's `configureRouter()`
     */
    loadChildRoutes(router?: Router): Promise<RouteConfig[]>;
    /**
     * Tells the platform loader to load the `routableModuleIds` assigned to this resource
     *
     * If `enableEagerLoading` is set to true, will also call this method on all child resources.
     *
     * Will do nothing on subsequent calls.
     *
     * This method is called by `loadChildRoutes()`
     */
    loadChildRouteModules(): Promise<void>;
    /**
     * Calls `loadChildRoutes()` to fetch the referenced modulesIds' `RouteConfig` objects, and maps them to the router.
     *
     * This method will be assigned to `target.prototype.configureRouter`, such that the routes will be configured
     * even if there is no `configureRouter()` method present.
     *
     * If `target.prototype.configureRouter` already exists, a reference to that original method will be kept
     * and called at the end of this `configureRouter()` method.
     */
    configureRouter(config: RouterConfiguration, router: Router): Promise<void>;
    protected getSettings(instruction?: IRoutableInstruction | IMapRoutablesInstruction): RouterMetadataSettings;
    protected getConfigFactory(): RouteConfigFactory;
    protected getModuleLoader(): IModuleLoader;
}
