import { Container } from "aurelia-dependency-injection";
import { Router, RouterConfiguration } from "aurelia-router";
import { ICompleteRouteConfig, IConfigureRouterInstruction, ICreateRouteConfigInstruction, IResourceLoader, IRouteConfig, IRouterConfiguration } from "./interfaces";
import { RouteConfigFactory } from "./route-config-factory";
import { RouterResource } from "./router-resource";
/**
 * Class used to configure behavior of [[RouterResource]]
 */
export declare class RouterMetadataConfiguration {
    protected static instance: RouterMetadataConfiguration;
    /**
     * Gets the global configuration instance. This will be automatically resolved from
     * [[Container.instance]] and assigned when first accessed.
     */
    /**
     * Sets the global configuration instance. Should be configured before setRoot()
     * for changes to propagate.
     */
    static INSTANCE: RouterMetadataConfiguration;
    protected container: Container;
    /**
     * @param container Optionally pass in a container to use for resolving the dependencies
     * that this class resolves. Will default to Container.instance if null.
     */
    constructor(container?: Container);
    /**
     * Gets the RouteConfigFactory that is registered with DI, or defaults to
     * [[DefaultRouteConfigFactory]] if its not registered.
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer to scope certain overrides for certain viewModels.
     */
    getConfigFactory(container?: Container): RouteConfigFactory;
    /**
     * Gets the RouterMetadataSettings that is registered with DI, or creates
     * a default one with noop functions if its not registered.
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer to scope certain overrides for certain viewModels.
     */
    getSettings(container?: Container): RouterMetadataSettings;
    /**
     * Gets the ResourceLoader that is registered with DI
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer to scope certain overrides for certain viewModels.
     */
    getResourceLoader(container?: Container): IResourceLoader;
}
/**
 * All available aurelia-router-metadata settings
 */
export declare class RouterMetadataSettings {
    [setting: string]: any;
    /**
     * The initial settings to use for each route before class-based conventions are applied
     */
    routeConfigDefaults: IRouteConfig;
    /**
     * RouteConfig settings that will be applied last before transformation; these settings will override all other defaults and arguments
     */
    routeConfigOverrides: IRouteConfig;
    /**
     * Perform any final modifications on the routes just before they are stored in the metadata
     * @param configs The route configs that were created by the @routeConfig() decorator
     * @param createInstruction The create instruction that was passed to the RouteConfigFactory
     */
    transformRouteConfigs: (configs: ICompleteRouteConfig[], createInstruction: ICreateRouteConfigInstruction) => ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;
    /**
     * Filter which routes from a @routeConfig are added to a @configureRouter's childRoutes
     */
    filterChildRoutes: (config: ICompleteRouteConfig, allConfigs: ICompleteRouteConfig[], configureInstruction: IConfigureRouterInstruction) => boolean | Promise<boolean> | PromiseLike<boolean>;
    /**
     * Enable/disable eager loading by default
     */
    enableEagerLoading: boolean;
    /**
     * Specify RouterConfiguration properties that need to be set on the AppRouter
     */
    routerConfiguration: IRouterConfiguration;
    /**
     * Called first when inside `configureRouter()`: childRoutes are not loaded, and no changes have
     * been made to the router, config or viewmodel yet.
     */
    onBeforeLoadChildRoutes: (viewModelInstance: any, config: RouterConfiguration, router: Router, resource: RouterResource, ...lifeCycleArgs: any[]) => void | Promise<void> | PromiseLike<void>;
    /**
     * Called directly after `loadChildRoutes()` and before `config.map(routes)`
     */
    onBeforeConfigMap: (viewModelInstance: any, config: RouterConfiguration, router: Router, resource: RouterResource, childRoutes: ICompleteRouteConfig[], ...lifeCycleArgs: any[]) => void | Promise<void> | PromiseLike<void>;
    /**
     * If true, target class will have its "router" property assigned from the proxied `configureRouter()` method.
     *
     * If a string is provided, the router will be assigned to the property with that name (implies true).
     *
     * If a function is provided, that function will be called during `configureRouter()` when normally the router would be assigned.
     * This is directly after `config.map(routes)` and before the RouterConfigurations are merged (if it's the root)
     */
    assignRouterToViewModel: boolean | string | ((viewModelInstance: any, config: RouterConfiguration, router: Router, resource: RouterResource, childRoutes: ICompleteRouteConfig[], ...lifeCycleArgs: any[]) => void | Promise<void> | PromiseLike<void>);
    /**
     * Called directly after the RouterConfigurations are merged (if it's the root)
     */
    onAfterMergeRouterConfiguration: (viewModelInstance: any, config: RouterConfiguration, router: Router, resource: RouterResource, childRoutes: ICompleteRouteConfig[], ...lifeCycleArgs: any[]) => void | Promise<void> | PromiseLike<void>;
    constructor();
}
