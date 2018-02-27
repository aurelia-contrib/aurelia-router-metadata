import { Container } from "aurelia-dependency-injection";
import { ICompleteRouteConfig, IConfigureRouterInstruction, ICreateRouteConfigInstruction, IResourceLoader, IRouteConfig, IRouterConfiguration } from "./interfaces";
import { RouteConfigFactory } from "./route-config-factory";
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
    transformRouteConfigs: (configs: ICompleteRouteConfig[], createInstruction: ICreateRouteConfigInstruction) => ICompleteRouteConfig[];
    /**
     * Filter which routes from a @routeConfig are added to a @configureRouter's childRoutes
     */
    filterChildRoutes: (config: ICompleteRouteConfig, allConfigs: ICompleteRouteConfig[], configureInstruction: IConfigureRouterInstruction) => boolean;
    /**
     * Enable/disable eager loading by default
     */
    enableEagerLoading: boolean;
    /**
     * Specify RouterConfiguration properties that need to be set on the AppRouter
     */
    routerConfiguration: IRouterConfiguration;
    constructor();
}
