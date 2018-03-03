"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
const aurelia_router_1 = require("aurelia-router");
const resource_loader_1 = require("./resource-loader");
const route_config_factory_1 = require("./route-config-factory");
/**
 * Class used to configure behavior of [[RouterResource]]
 */
class RouterMetadataConfiguration {
    /**
     * Gets the global configuration instance. This will be automatically resolved from
     * [[Container.instance]] and assigned when first accessed.
     */
    static get INSTANCE() {
        if (!this.instance) {
            this.instance = aurelia_dependency_injection_1.Container.instance.get(RouterMetadataConfiguration);
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
        this.container = container || aurelia_dependency_injection_1.Container.instance;
    }
    /**
     * Gets the RouteConfigFactory that is registered with DI, or defaults to
     * [[DefaultRouteConfigFactory]] if its not registered.
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer to scope certain overrides for certain viewModels.
     */
    getConfigFactory(container) {
        const c = container || this.container;
        if (!c.hasResolver(route_config_factory_1.RouteConfigFactory)) {
            c.registerSingleton(route_config_factory_1.RouteConfigFactory, route_config_factory_1.DefaultRouteConfigFactory);
        }
        return c.get(route_config_factory_1.RouteConfigFactory);
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
        return c.get(resource_loader_1.ResourceLoader);
    }
}
exports.RouterMetadataConfiguration = RouterMetadataConfiguration;
const noTransform = (configs) => configs;
const noFilter = () => true;
const defaults = {
    nav: true
};
const overrides = {};
/**
 * All available aurelia-router-metadata settings
 */
class RouterMetadataSettings {
    constructor() {
        this.routeConfigDefaults = defaults;
        this.routeConfigOverrides = overrides;
        this.transformRouteConfigs = noTransform;
        this.filterChildRoutes = noFilter;
        this.enableEagerLoading = true;
        this.routerConfiguration = new aurelia_router_1.RouterConfiguration();
        this.onBeforeLoadChildRoutes = null;
        this.onBeforeConfigMap = null;
        this.assignRouterToViewModel = false;
        this.onAfterMergeRouterConfiguration = null;
    }
}
exports.RouterMetadataSettings = RouterMetadataSettings;
