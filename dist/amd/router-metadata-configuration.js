define(["require", "exports", "@src/registry", "@src/resource-loader", "@src/route-config-factory", "aurelia-dependency-injection", "aurelia-router"], function (require, exports, registry_1, resource_loader_1, route_config_factory_1, aurelia_dependency_injection_1, aurelia_router_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    class RouterMetadataSettings {
        constructor() {
            this.routeConfigDefaults = defaults;
            this.routeConfigOverrides = overrides;
            this.transformRouteConfigs = noTransform;
            this.filterChildRoutes = noFilter;
            this.enableEagerLoading = true;
            this.enableStaticAnalysis = true;
            this.routerConfiguration = new aurelia_router_1.RouterConfiguration();
            this.onBeforeLoadChildRoutes = noAction;
            this.onBeforeConfigMap = noAction;
            this.assignRouterToViewModel = false;
            this.onAfterMergeRouterConfiguration = noAction;
        }
    }
    exports.RouterMetadataSettings = RouterMetadataSettings;
    /**
     * Class used to configure behavior of [[RouterResource]]
     */
    class RouterMetadataConfiguration {
        /**
         * Gets the global configuration instance. This will be automatically resolved from
         * [[Container.instance]] and assigned when first accessed.
         */
        static get INSTANCE() {
            if (this.instance === undefined) {
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
        getRegistry(container) {
            const c = container || this.container;
            return c.get(registry_1.Registry);
        }
    }
    exports.RouterMetadataConfiguration = RouterMetadataConfiguration;
});
