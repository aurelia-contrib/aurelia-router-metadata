System.register(["aurelia-dependency-injection", "aurelia-router", "./registry", "./resource-loader", "./route-config-factory"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var aurelia_dependency_injection_1, aurelia_router_1, registry_1, resource_loader_1, route_config_factory_1, noTransform, noFilter, noAction, defaults, overrides, RouterMetadataSettings, RouterMetadataConfiguration;
    return {
        setters: [
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (aurelia_router_1_1) {
                aurelia_router_1 = aurelia_router_1_1;
            },
            function (registry_1_1) {
                registry_1 = registry_1_1;
            },
            function (resource_loader_1_1) {
                resource_loader_1 = resource_loader_1_1;
            },
            function (route_config_factory_1_1) {
                route_config_factory_1 = route_config_factory_1_1;
            }
        ],
        execute: function () {
            noTransform = (configs) => configs;
            noFilter = () => true;
            // tslint:disable-next-line:no-empty
            noAction = (..._) => { };
            defaults = {
                nav: true
            };
            overrides = {};
            /**
             * All available aurelia-router-metadata settings
             */
            RouterMetadataSettings = class RouterMetadataSettings {
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
            };
            exports_1("RouterMetadataSettings", RouterMetadataSettings);
            /**
             * Class used to configure behavior of [[RouterResource]]
             */
            RouterMetadataConfiguration = class RouterMetadataConfiguration {
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
            };
            exports_1("RouterMetadataConfiguration", RouterMetadataConfiguration);
        }
    };
});
//# sourceMappingURL=router-metadata-configuration.js.map