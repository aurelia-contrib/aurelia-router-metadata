import { getLogger } from "aurelia-logging";
import { AppRouter } from "aurelia-router";
import { routerMetadata } from "./router-metadata";
import { RouterMetadataConfiguration } from "./router-metadata-configuration";
const configureRouterSymbol = Symbol("configureRouter");
const logger = getLogger("router-metadata");
/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
export class RouterResource {
    /**
     * Only applicable when `isConfigureRouter`
     *
     * A convenience property which returns `router.container`, or `null` if the router is not set
     */
    get container() {
        return this.router ? this.router.container : null;
    }
    /**
     * Only applicable when `isConfigureRouter`
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
        const ownName = this.ownRoutes.length > 0 ? this.ownRoutes[0].name : "";
        const parentPath = this.parent ? this.parent.path : null;
        return parentPath ? `${parentPath}/${ownName}` : ownName;
    }
    constructor(target, moduleId) {
        this.target = target;
        this.moduleId = moduleId;
        this.isRouteConfig = false;
        this.isConfigureRouter = false;
        this.routeConfigModuleIds = [];
        this.enableEagerLoading = false;
        this.createRouteConfigInstruction = null;
        this.ownRoutes = [];
        this.childRoutes = [];
        this.filterChildRoutes = null;
        this.areChildRoutesLoaded = false;
        this.areOwnRoutesLoaded = false;
        this.isConfiguringRouter = false;
        this.isRouterConfigured = false;
        this.parent = null;
        this.router = null;
    }
    /**
     * Creates a `@routeConfig` based on the provided instruction.
     *
     * This method is called by the `@routeConfig()` decorator, and can be used instead of the @routeConfig() decorator
     * to achieve the same effect.
     * @param instruction Instruction containing the parameters passed to the `@routeConfig` decorator
     */
    static ROUTE_CONFIG(instruction) {
        const resource = routerMetadata.getOrCreateOwn(instruction.target);
        resource.initialize(instruction);
        return resource;
    }
    /**
     * Creates a `@configureRouter` based on the provided instruction.
     *
     * This method is called by the `@configureRouter()` decorator, and can be used instead of the @configureRouter() decorator
     * to achieve the same effect.
     * @param instruction Instruction containing the parameters passed to the `@configureRouter` decorator
     */
    static CONFIGURE_ROUTER(instruction) {
        const resource = routerMetadata.getOrCreateOwn(instruction.target);
        resource.initialize(instruction);
        return resource;
    }
    /**
     * Initializes this resource based on the provided instruction.
     *
     * This method is called by the static `ROUTE_CONFIG` and `CONFIGURE_ROUTER` methods, and can be used instead of those
     * to achieve the same effect. If there is a `routeConfigModuleIds` property present on the instruction, it will
     * be initialized as `configureRouter`, otherwise as `routeConfig`
     * @param instruction Instruction containing the parameters passed to the `@configureRouter` decorator
     */
    initialize(instruction) {
        if (!instruction) {
            // We're not being called from a decorator, so just apply defaults as if we're a @routeConfig
            // tslint:disable-next-line:no-parameter-reassignment
            instruction = { target: this.target };
        }
        const settings = this.getSettings(instruction);
        const target = instruction.target;
        if (isConfigureRouterInstruction(instruction)) {
            logger.debug(`initializing @configureRouter for ${target.name}`);
            this.isConfigureRouter = true;
            const configureInstruction = instruction;
            this.routeConfigModuleIds = ensureArray(configureInstruction.routeConfigModuleIds);
            this.filterChildRoutes = settings.filterChildRoutes;
            this.enableEagerLoading = settings.enableEagerLoading;
            assignOrProxyPrototypeProperty(target.prototype, "configureRouter", configureRouterSymbol, configureRouter);
        }
        else {
            logger.debug(`initializing @routeConfig for ${target.name}`);
            this.isRouteConfig = true;
            const configInstruction = instruction;
            this.createRouteConfigInstruction = Object.assign({}, configInstruction, { settings });
        }
    }
    async loadOwnRoutes(router) {
        this.router = router || null;
        if (this.areOwnRoutesLoaded) {
            return this.ownRoutes;
        }
        // If we're in this method then it can never be the root, so it's always safe to apply @routeConfig initialization
        if (!this.isRouteConfig) {
            this.isRouteConfig = true;
            this.initialize(this.createRouteConfigInstruction);
        }
        const instruction = this.createRouteConfigInstruction;
        instruction.moduleId = instruction.moduleId || this.moduleId;
        const configs = await this.getConfigFactory().createRouteConfigs(instruction);
        for (const config of configs) {
            config.settings.routerResource = this;
            this.ownRoutes.push(config);
        }
        this.areOwnRoutesLoaded = true;
        return this.ownRoutes;
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
    async loadChildRoutes(router) {
        this.router = router || null;
        if (this.areChildRoutesLoaded) {
            return this.childRoutes;
        }
        logger.debug(`loading childRoutes for ${this.target.name}`);
        const loader = this.getResourceLoader();
        for (const moduleId of this.routeConfigModuleIds) {
            const resource = await loader.loadRouterResource(moduleId);
            const childRoutes = await resource.loadOwnRoutes();
            resource.parent = this;
            if (resource.isConfigureRouter && this.enableEagerLoading) {
                await resource.loadChildRoutes();
            }
            for (const childRoute of childRoutes) {
                if (await this.filterChildRoutes(childRoute, childRoutes, this)) {
                    if (this.ownRoutes.length > 0) {
                        childRoute.settings.parentRoute = this.ownRoutes[0];
                    }
                    this.childRoutes.push(childRoute);
                }
            }
        }
        if (this.isRouteConfig) {
            const ownRoutes = await this.loadOwnRoutes();
            for (const ownRoute of ownRoutes) {
                ownRoute.settings.childRoutes = this.childRoutes;
            }
        }
        this.areChildRoutesLoaded = true;
        return this.childRoutes;
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
    async configureRouter(config, router, ...args) {
        const viewModel = router.container.viewModel;
        const settings = this.getSettings();
        if (typeof settings.onBeforeLoadChildRoutes === "function") {
            await settings.onBeforeLoadChildRoutes(viewModel, config, router, this, ...args);
        }
        this.isConfiguringRouter = true;
        const routes = await this.loadChildRoutes();
        assignPaths(routes);
        if (typeof settings.onBeforeConfigMap === "function") {
            await settings.onBeforeConfigMap(viewModel, config, router, this, routes, ...args);
        }
        config.map(routes);
        this.router = router;
        if (router instanceof AppRouter || router.isRoot) {
            const assign = settings.assignRouterToViewModel;
            if (assign === true) {
                viewModel.router = router;
            }
            else if (Object.prototype.toString.call(assign) === "[object String]") {
                viewModel[assign] = router;
            }
            else if (typeof assign === "function") {
                await assign(viewModel, config, router, this, routes, ...args);
            }
            const settingsConfig = this.getSettings().routerConfiguration || {};
            mergeRouterConfiguration(config, settingsConfig);
            if (typeof settings.onAfterMergeRouterConfiguration === "function") {
                await settings.onAfterMergeRouterConfiguration(viewModel, config, router, this, routes, ...args);
            }
        }
        this.isRouterConfigured = true;
        this.isConfiguringRouter = false;
        const originalConfigureRouter = this.target.prototype[configureRouterSymbol];
        if (originalConfigureRouter !== undefined) {
            return originalConfigureRouter.call(viewModel, config, router);
        }
    }
    getSettings(instruction) {
        const settings = RouterMetadataConfiguration.INSTANCE.getSettings(this.container);
        if (instruction) {
            Object.assign(settings, instruction.settings || {});
        }
        return settings;
    }
    getConfigFactory() {
        return RouterMetadataConfiguration.INSTANCE.getConfigFactory(this.container);
    }
    getResourceLoader() {
        return RouterMetadataConfiguration.INSTANCE.getResourceLoader(this.container);
    }
}
function isConfigureRouterInstruction(instruction) {
    return !!instruction.routeConfigModuleIds;
}
function ensureArray(value) {
    if (value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}
function assignPaths(routes) {
    for (const route of routes) {
        const parentPath = route.settings.parentRoute ? route.settings.parentRoute.settings.path : "";
        const pathProperty = route.settings.pathProperty || "route";
        const path = route[pathProperty];
        route.settings.path = `${parentPath}/${path}`.replace(/\/\//g, "/");
        assignPaths(route.settings.childRoutes || []);
    }
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
async function configureRouter(config, router, ...args) {
    const target = Object.getPrototypeOf(this).constructor;
    const resource = routerMetadata.getOwn(target);
    await resource.configureRouter(config, router, ...args);
}
// tslint:enable:no-invalid-this
function mergeRouterConfiguration(target, source) {
    target.instructions = (target.instructions || []).concat(source.instructions || []);
    target.options = Object.assign({}, (target.options || {}), (source.options || {}));
    target.pipelineSteps = (target.pipelineSteps || []).concat(source.pipelineSteps || []);
    target.title = source.title;
    target.unknownRouteConfig = source.unknownRouteConfig;
    target.viewPortDefaults = Object.assign({}, (target.viewPortDefaults || {}), (source.viewPortDefaults || {}));
    return target;
}
