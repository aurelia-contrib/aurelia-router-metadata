import { Container } from "aurelia-dependency-injection";
import { IModuleLoader } from "./interfaces";
import { RouteConfigFactory } from "./route-config-factory";
import { RouterMetadataSettings } from "./router-metadata-settings";
/**
 * Class used to configure behavior of [[RoutableResource]]
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
     * Can be a ChildContainer in to scope certain overrides for certain viewModels.
     */
    getConfigFactory(container?: Container): RouteConfigFactory;
    /**
     * Gets the RouterMetadataSettings that is registered with DI, or creates
     * a default one with noop functions if its not registered.
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer in to scope certain overrides for certain viewModels.
     */
    getSettings(container?: Container): RouterMetadataSettings;
    /**
     * Gets the Loader instance that is registered with the PLATFORM.Loader key
     * Mostly intended for unit testing where module loading needs to be mocked,
     * but can be overriden if needed.
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer in to scope certain overrides for certain viewModels.
     */
    getModuleLoader(container?: Container): IModuleLoader;
}
