"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const aurelia_logging_1 = require("aurelia-logging");
const router_metadata_1 = require("./router-metadata");
const router_metadata_configuration_1 = require("./router-metadata-configuration");
const configureRouterSymbol = Symbol("configureRouter");
const logger = aurelia_logging_1.getLogger("router-metadata");
/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
class RoutableResource {
    /**
     * Only applicable when `isMapRoutables`
     *
     * A convenience property which returns `router.container`, or `null` if the router is not set
     */
    get container() {
        return this.router ? this.router.container : null;
    }
    /**
     * Only applicable when `isMapRoutables`
     *
     * A convenience property which returns `router.container.viewModel`, or `null` if the router is not set
     * This is an instance of the target class
     */
    get instance() {
        return this.container ? this.container.viewModel : null;
    }
    /**
     * Returns a concatenation separated by '/' of the name of the first of `ownRoutes` of this instance,
     * together with the parents up to the root
     */
    get path() {
        const ownName = (this.ownRoutes.length > 0 ? this.ownRoutes[0].name : null);
        const parentPath = (this.parent ? this.parent.path : null);
        return parentPath ? `${parentPath}/${ownName}` : ownName;
    }
    constructor(moduleId, target) {
        this.moduleId = moduleId;
        this.target = target;
        this.isRoutable = false;
        this.isMapRoutables = false;
        this.routableModuleIds = [];
        this.enableEagerLoading = false;
        this.ownRoutes = [];
        this.childRoutes = [];
        this.filterChildRoutes = null;
        this.areChildRoutesLoaded = false;
        this.areChildRouteModulesLoaded = false;
        this.isConfiguringRouter = false;
        this.isRouterConfigured = false;
        this.parent = null;
        this.router = null;
    }
    /**
     * Creates a `@routable` based on the provided instruction.
     *
     * This method is called by the `@routable()` decorator, and can be used instead of the @routable() decorator
     * to achieve the same effect.
     * @param instruction Instruction containing the parameters passed to the `@routable` decorator
     */
    static ROUTABLE(instruction) {
        const resource = router_metadata_1.routerMetadata.getOrCreateOwn(instruction.target);
        resource.initialize(instruction);
        return resource;
    }
    /**
     * Creates a `@mapRoutables` based on the provided instruction.
     *
     * This method is called by the `@mapRoutables()` decorator, and can be used instead of the @mapRoutables() decorator
     * to achieve the same effect.
     * @param instruction Instruction containing the parameters passed to the `@mapRoutables` decorator
     */
    static MAP_ROUTABLES(instruction) {
        const resource = router_metadata_1.routerMetadata.getOrCreateOwn(instruction.target);
        resource.initialize(instruction);
        return resource;
    }
    /**
     * Initializes this resource based on the provided instruction.
     *
     * This method is called by the static `ROUTABLE` and `MAP_ROUTABLES` methods, and can be used instead of those
     * to achieve the same effect. If there is a `routableModuleIds` property present on the instruction, it will
     * be initialized as `@mapRoutables`, otherwise as `@routable`. To initialize a class as both, you'll need to call
     * this method twice with the appropriate instruction.
     * @param instruction Instruction containing the parameters passed to the `@mapRoutables` decorator
     */
    initialize(instruction) {
        const settings = this.getSettings(instruction);
        const moduleId = this.moduleId;
        const target = instruction.target;
        if (isMapRoutablesInstruction(instruction)) {
            logger.debug(`initializing @mapRoutables for ${moduleId}`);
            const mapInstruction = instruction;
            this.isMapRoutables = true;
            this.routableModuleIds = ensureArray(mapInstruction.routableModuleIds);
            this.filterChildRoutes = settings.filterChildRoutes;
            this.enableEagerLoading = settings.enableEagerLoading;
            assignOrProxyPrototypeProperty(target.prototype, "configureRouter", configureRouterSymbol, configureRouter);
        }
        else {
            logger.debug(`initializing @routable for ${this.moduleId}`);
            this.isRoutable = true;
            const configInstruction = Object.assign({}, instruction, { moduleId, settings });
            const configs = this.getConfigFactory().createRouteConfigs(configInstruction);
            for (const config of configs) {
                config.settings.routableResource = this;
                this.ownRoutes.push(config);
            }
        }
    }
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
    loadChildRoutes(router) {
        return __awaiter(this, void 0, void 0, function* () {
            this.router = router || null;
            if (this.areChildRoutesLoaded) {
                return this.childRoutes;
            }
            logger.debug(`loading childRoutes for ${this.moduleId}`);
            yield this.loadChildRouteModules();
            for (const moduleId of this.routableModuleIds) {
                const resource = router_metadata_1.routerMetadata.getOwn(moduleId);
                resource.parent = this;
                if (resource.isMapRoutables && this.enableEagerLoading) {
                    yield resource.loadChildRoutes();
                }
                for (const childRoute of resource.ownRoutes) {
                    if (this.filterChildRoutes(childRoute, resource.ownRoutes, this)) {
                        if (this.ownRoutes.length > 0) {
                            childRoute.settings.parentRoute = this.ownRoutes[0];
                        }
                        this.childRoutes.push(childRoute);
                    }
                }
            }
            for (const ownRoute of this.ownRoutes) {
                ownRoute.settings.childRoutes = this.childRoutes;
            }
            this.areChildRoutesLoaded = true;
            return this.childRoutes;
        });
    }
    /**
     * Tells the platform loader to load the `routableModuleIds` assigned to this resource
     *
     * If `enableEagerLoading` is set to true, will also call this method on all child resources.
     *
     * Will do nothing on subsequent calls.
     *
     * This method is called by `loadChildRoutes()`
     */
    loadChildRouteModules() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.areChildRouteModulesLoaded) {
                return;
            }
            yield this.getModuleLoader().loadAllModules(this.routableModuleIds);
            if (this.enableEagerLoading) {
                for (const moduleId of this.routableModuleIds) {
                    const resource = router_metadata_1.routerMetadata.getOwn(moduleId);
                    resource.parent = this;
                    if (resource.isMapRoutables) {
                        yield resource.loadChildRouteModules();
                    }
                }
            }
            this.areChildRouteModulesLoaded = true;
        });
    }
    /**
     * Calls `loadChildRoutes()` to fetch the referenced modulesIds' `RouteConfig` objects, and maps them to the router.
     *
     * This method will be assigned to `target.prototype.configureRouter`, such that the routes will be configured
     * even if there is no `configureRouter()` method present.
     *
     * If `target.prototype.configureRouter` already exists, a reference to that original method will be kept
     * and called at the end of this `configureRouter()` method.
     */
    configureRouter(config, router) {
        return __awaiter(this, void 0, void 0, function* () {
            this.isConfiguringRouter = true;
            const routes = yield this.loadChildRoutes();
            config.map(routes);
            this.router = router;
            this.isRouterConfigured = true;
            this.isConfiguringRouter = false;
            const originalConfigureRouter = this.target.prototype[configureRouterSymbol];
            if (originalConfigureRouter !== undefined) {
                return originalConfigureRouter.call(router.container.viewModel, config, router);
            }
        });
    }
    getSettings(instruction) {
        const settings = router_metadata_configuration_1.RouterMetadataConfiguration.INSTANCE.getSettings(this.container);
        if (instruction) {
            return overrideSettings(settings, instruction);
        }
        return settings;
    }
    getConfigFactory() {
        return router_metadata_configuration_1.RouterMetadataConfiguration.INSTANCE.getConfigFactory(this.container);
    }
    getModuleLoader() {
        return router_metadata_configuration_1.RouterMetadataConfiguration.INSTANCE.getModuleLoader(this.container);
    }
}
exports.RoutableResource = RoutableResource;
function isMapRoutablesInstruction(instruction) {
    return !!instruction.routableModuleIds;
}
function overrideSettings(settings, instruction) {
    if (isMapRoutablesInstruction(instruction)) {
        const mapInstruction = instruction;
        if (mapInstruction.enableEagerLoading !== undefined) {
            settings.enableEagerLoading = mapInstruction.enableEagerLoading;
        }
        if (mapInstruction.filterChildRoutes !== undefined) {
            settings.filterChildRoutes = mapInstruction.filterChildRoutes;
        }
    }
    else {
        const routeInstruction = instruction;
        if (routeInstruction.transformRouteConfigs !== undefined) {
            settings.transformRouteConfigs = routeInstruction.transformRouteConfigs;
        }
    }
    return settings;
}
function ensureArray(value) {
    if (value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}
function assignOrProxyPrototypeProperty(proto, name, refSymbol, value) {
    if (name in proto) {
        let protoOrBase = proto;
        while (!protoOrBase.hasOwnProperty(name)) {
            protoOrBase = Object.getPrototypeOf(protoOrBase);
        }
        const original = protoOrBase[name];
        proto[refSymbol] = original;
    }
    proto[name] = value;
}
// tslint:disable:no-invalid-this
function configureRouter(config, router) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = Object.getPrototypeOf(this).constructor;
        const resource = router_metadata_1.routerMetadata.getOwn(target);
        yield resource.configureRouter(config, router);
    });
}
// tslint:enable:no-invalid-this
//# sourceMappingURL=routable-resource.js.map