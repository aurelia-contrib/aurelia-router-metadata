"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
const aurelia_pal_1 = require("aurelia-pal");
const route_config_factory_1 = require("./route-config-factory");
const router_metadata_settings_1 = require("./router-metadata-settings");
/**
 * Class used to configure behavior of [[RoutableResource]]
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
     * Can be a ChildContainer in to scope certain overrides for certain viewModels.
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
     * Can be a ChildContainer in to scope certain overrides for certain viewModels.
     */
    getSettings(container) {
        const c = container || this.container;
        return c.get(router_metadata_settings_1.RouterMetadataSettings);
    }
    /**
     * Gets the Loader instance that is registered with the PLATFORM.Loader key
     * Mostly intended for unit testing where module loading needs to be mocked,
     * but can be overriden if needed.
     * @param container Optionally pass in a container to use for resolving this dependency.
     * Can be a ChildContainer in to scope certain overrides for certain viewModels.
     */
    getModuleLoader(container) {
        const c = container || this.container;
        return c.get(aurelia_pal_1.PLATFORM.Loader);
    }
}
exports.RouterMetadataConfiguration = RouterMetadataConfiguration;
//# sourceMappingURL=router-metadata-configuration.js.map