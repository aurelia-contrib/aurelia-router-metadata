import { Container } from "aurelia-dependency-injection";
import { Router, RouterConfiguration } from "aurelia-router";
import { ICompleteRouteConfig, IConfigureRouterInstruction, ICreateRouteConfigInstruction, IResourceLoader, IRouteConfigInstruction, IRouterResourceTarget, IRouterResourceTargetProto } from "./interfaces";
import { RouteConfigFactory } from "./route-config-factory";
import { RouterMetadataSettings } from "./router-metadata-configuration";
/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
export declare class RouterResource {
    /**
     * The target ("constructor Function") of the class this resource applies to
     */
    target: IRouterResourceTarget;
    /**
     * The moduleId (`PLATFORM.moduleName`) of the class this resource applies to
     */
    moduleId?: string;
    /**
     * True if this resource is a `@routeConfig`
     */
    isRouteConfig: boolean;
    /**
     * True if this resource is a `@configureRouter`
     */
    isConfigureRouter: boolean;
    /**
     * Only applicable when `isConfigureRouter`
     *
     * The moduleIds (`PLATFORM.moduleName`) of the routes that will be mapped on the target class' router
     */
    routeConfigModuleIds: string[];
    /**
     * Only applicable when `isConfigureRouter`
     *
     * If true: when `loadChildRoutes()`is called on this instance, it will also call `loadChildRoutes()` on the resources
     * associated with the `routeConfigModuleIds` set on this instance (if they are also `@configureRouter`)
     */
    enableEagerLoading: boolean;
    /**
     * Only applicable when `isRouteConfig`
     *
     * The `RouteConfig` objects with which the target's class is mapped in parent `@configureRouter`
     */
    ownRoutes: ICompleteRouteConfig[];
    /**
     * Only applicable when `isConfigureRouter`
     *
     * The `RouteConfig` objects that will be mapped on the target class' router
     */
    childRoutes: ICompleteRouteConfig[];
    /**
     * Only applicable when `isConfigureRouter`
     *
     * Filter function to determine which `RouteConfig` objects to exclude from mapping on the target class' router
     */
    filterChildRoutes: (config: ICompleteRouteConfig, allConfigs: ICompleteRouteConfig[], configureInstruction: IConfigureRouterInstruction) => boolean;
    /**
     * Only applicable when `isRouteConfig`
     *
     * Instruction that describes how the RouteConfigs (ownRoutes) should be created when the routes
     * are requested to be loaded.
     */
    createRouteConfigInstruction: ICreateRouteConfigInstruction;
    /**
     * Only applicable when `isConfigureRouter`
     *
     * True if `loadChildRoutes()` has run on this instance
     */
    areChildRoutesLoaded: boolean;
    /**
     * Only applicable when `isRouteConfig`
     *
     * True if `loadOwnRoutes()` has run on this instance
     */
    areOwnRoutesLoaded: boolean;
    /**
     * Only applicable when `isConfigureRouter`
     *
     * True if `configureRouter()` was invoked on the target class, and we are currently still loading the child routes
     */
    isConfiguringRouter: boolean;
    /**
     * Only applicable when `isConfigureRouter`
     *
     * True if `configureRouter()` has run on this instance and the childRoutes are mapped to the target class' router
     */
    isRouterConfigured: boolean;
    /**
     * The parent route
     */
    parent: RouterResource;
    /**
     * Only applicable when `isConfigureRouter`
     *
     * The router that was passed to the target class' `configureRouter()` method
     */
    router: Router;
    /**
     * Only applicable when `isConfigureRouter`
     *
     * A convenience property which returns `router.container`, or `null` if the router is not set
     */
    readonly container: Container;
    /**
     * Only applicable when `isConfigureRouter`
     *
     * A convenience property which returns `router.container.viewModel`, or `null` if the router is not set
     * This is an instance of the target class
     */
    readonly instance: IRouterResourceTargetProto;
    /**
     * Returns a concatenation separated by '/' of the name of the first of `ownRoutes` of this instance,
     * together with the parents up to the root
     */
    readonly path: string;
    constructor(target: IRouterResourceTarget, moduleId?: string);
    /**
     * Creates a `@routeConfig` based on the provided instruction.
     *
     * This method is called by the `@routeConfig()` decorator, and can be used instead of the @routeConfig() decorator
     * to achieve the same effect.
     * @param instruction Instruction containing the parameters passed to the `@routeConfig` decorator
     */
    static ROUTE_CONFIG(instruction: IRouteConfigInstruction): RouterResource;
    /**
     * Creates a `@configureRouter` based on the provided instruction.
     *
     * This method is called by the `@configureRouter()` decorator, and can be used instead of the @configureRouter() decorator
     * to achieve the same effect.
     * @param instruction Instruction containing the parameters passed to the `@configureRouter` decorator
     */
    static CONFIGURE_ROUTER(instruction: IConfigureRouterInstruction): RouterResource;
    /**
     * Initializes this resource based on the provided instruction.
     *
     * This method is called by the static `ROUTE_CONFIG` and `CONFIGURE_ROUTER` methods, and can be used instead of those
     * to achieve the same effect. If there is a `routeConfigModuleIds` property present on the instruction, it will
     * be initialized as `configureRouter`, otherwise as `routeConfig`
     * @param instruction Instruction containing the parameters passed to the `@configureRouter` decorator
     */
    initialize(instruction?: IRouteConfigInstruction | IConfigureRouterInstruction): void;
    loadOwnRoutes(router?: Router): ICompleteRouteConfig[];
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
    loadChildRoutes(router?: Router): Promise<ICompleteRouteConfig[]>;
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
    protected getSettings(instruction?: IRouteConfigInstruction | IConfigureRouterInstruction): RouterMetadataSettings;
    protected getConfigFactory(): RouteConfigFactory;
    protected getResourceLoader(): IResourceLoader;
}
