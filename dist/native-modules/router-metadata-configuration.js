import { Container } from "aurelia-dependency-injection";
import { RouterConfiguration } from "aurelia-router";
import { Registry } from "./registry";
import { ResourceLoader } from "./resource-loader";
import { DefaultRouteConfigFactory, RouteConfigFactory } from "./route-config-factory";
const noTransform = (configs) => configs;
const noFilter = () => true;
// tslint:disable-next-line:no-empty
const noAction = (..._) => { };
const defaults = {
    nav: true
};
const overrides = {};
/**
 * All available aurelia-router-metadata settings
 */
export class RouterMetadataSettings {
    constructor() {
        this.routeConfigDefaults = defaults;
        this.routeConfigOverrides = overrides;
        this.transformRouteConfigs = noTransform;
        this.filterChildRoutes = noFilter;
        this.enableEagerLoading = true;
        this.enableStaticAnalysis = true;
        this.routerConfiguration = new RouterConfiguration();
        this.onBeforeLoadChildRoutes = noAction;
        this.onBeforeConfigMap = noAction;
        this.assignRouterToViewModel = false;
        this.onAfterMergeRouterConfiguration = noAction;
    }
}
/**
 * Class used to configure behavior of [[RouterResource]]
 */
export class RouterMetadataConfiguration {
    /**
     * Gets the global configuration instance. This will be automatically resolved from
     * [[Container.instance]] and assigned when first accessed.
     */
    static get INSTANCE() {
        if (this.instance === undefined) {
            this.instance = Container.instance.get(RouterMetadataConfiguration);
        }
        return this.instance;
    }
    /**
     * Sets the global configuration instance. Should be configured before setRoot()
     * for changes to propagate.
     */
    static set INSTANCE(instance) {
        this.instance = instance;
    }
    /**
     * @param container Optionally pass in a container to use for resolving the dependencies
     * that this class resolves. Will default to Container.instance if null.
     */
    constructor(container) {
        this.container = container || Container.instance;
    }
    /**
     * Makes this configuration instance globally reachable through RouterMetadataConfiguration.INSTANCE
     */
    makeGlobal() {
        RouterMetadataConfiguration.INSTANCE = this;
        return this;
    }
    /**
     * Gets the RouteConfigFactory that is registered with DI, or defaults to
     * [[DefaultRouteConfigFactory]] if its not registered.
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer to scope certain overrides for certain viewModels.
     */
    getConfigFactory(container) {
        const c = container || this.container;
        if (!c.hasResolver(RouteConfigFactory)) {
            c.registerSingleton(RouteConfigFactory, DefaultRouteConfigFactory);
        }
        return c.get(RouteConfigFactory);
    }
    /**
     * Gets the RouterMetadataSettings that is registered with DI, or creates
     * a default one with noop functions if its not registered.
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer to scope certain overrides for certain viewModels.
     */
    getSettings(container) {
        const c = container || this.container;
        return c.get(RouterMetadataSettings);
    }
    /**
     * Gets the ResourceLoader that is registered with DI
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer to scope certain overrides for certain viewModels.
     */
    getResourceLoader(container) {
        const c = container || this.container;
        return c.get(ResourceLoader);
    }
    getRegistry(container) {
        const c = container || this.container;
        return c.get(Registry);
    }
}
//# sourceMappingURL=router-metadata-configuration.js.map