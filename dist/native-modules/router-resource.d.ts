import { ICompleteRouteConfig, IConfigureRouterInstruction, ICreateRouteConfigInstruction, IResourceLoader, IRouteConfigInstruction, IRouterResourceTarget, IRouterResourceTargetProto } from "@src/interfaces";
import { $Module } from "@src/model";
import { Registry } from "@src/registry";
import { RouteConfigFactory } from "@src/route-config-factory";
import { RouterMetadataSettings } from "@src/router-metadata-configuration";
import { Container } from "aurelia-dependency-injection";
import { Router, RouterConfiguration } from "aurelia-router";
/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
export declare class RouterResource {
    static originalConfigureRouterSymbol: any;
    static originalMapSymbol: any;
    static viewModelSymbol: any;
    static routerResourceSymbol: any;
    $module: $Module | null;
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
     * Only applicable when `isConfigureRouter`
     *
     * If true: will look for `RouteConfig` objects in the `configureRouter()` method of the target class and treat them as if
     * they were defined in decorators.
     * Currently only works on non-async methods and the moduleId must be either a pure string or a `PLATFORM.moduleName` call.
     * Other properties will only be included if they are "hard-coded".
     */
    enableStaticAnalysis: boolean;
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
    filterChildRoutes: ((config: ICompleteRouteConfig, allConfigs: ICompleteRouteConfig[], configureInstruction: IConfigureRouterInstruction) => boolean | Promise<boolean> | PromiseLike<boolean>) | null;
    /**
     * Only applicable when `isRouteConfig`
     *
     * Instruction that describes how the RouteConfigs (ownRoutes) should be created when the routes
     * are requested to be loaded.
     */
    createRouteConfigInstruction: ICreateRouteConfigInstruction | null;
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
     * All parents of this route
     */
    parents: Set<RouterResource>;
    /**
     * The first (primary) parent of this route
     */
    readonly parent: RouterResource | null;
    /**
     * Only applicable when `isConfigureRouter`
     *
     * The router that was passed to the target class' `configureRouter()` method
     */
    router: Router | null;
    /**
     * Only applicable when `isConfigureRouter`
     *
     * A convenience property which returns `router.container`, or `null` if the router is not set
     */
    readonly container: Container | null;
    /**
     * Only applicable when `isConfigureRouter`
     *
     * A convenience property which returns `router.container.viewModel`, or `null` if the router is not set
     * This is an instance of the target class
     */
    readonly instance: IRouterResourceTargetProto | null;
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
     * If there is a `routeConfigModuleIds` property present on the instruction,
     * or the target has a `configureRouter()` method, it will be initialized as `configureRouter`, otherwise as `routeConfig`
     * @param instruction Instruction containing the parameters passed to the `@configureRouter` decorator
     */
    initialize(instruction?: IRouteConfigInstruction | IConfigureRouterInstruction | null): void;
    /**
     * Ensures that the module for this resources is loaded and registered so that its routing information can be queried.
     */
    load(): Promise<void>;
    loadOwnRoutes(): Promise<ICompleteRouteConfig[]>;
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
    configureRouter(config: RouterConfiguration, router: Router, ...args: any[]): Promise<void>;
    protected ensureCreateRouteConfigInstruction(): ICreateRouteConfigInstruction;
    protected getSettings(instruction?: IRouteConfigInstruction | IConfigureRouterInstruction): RouterMetadataSettings;
    protected getConfigFactory(): RouteConfigFactory;
    protected getResourceLoader(): IResourceLoader;
    protected getRegistry(): Registry;
}
