import { RouteConfigSplitter } from "@src/resolution/functions";
import { routerMetadata } from "@src/router-metadata";
import { RouterMetadataConfiguration } from "@src/router-metadata-configuration";
import { getLogger } from "aurelia-logging";
import { AppRouter } from "aurelia-router";
const logger = getLogger("router-metadata");
/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
export class RouterResource {
    constructor(target, moduleId) {
        this.$module = null;
        this.target = target;
        this.moduleId = moduleId;
        this.isRouteConfig = false;
        this.isConfigureRouter = false;
        this.routeConfigModuleIds = [];
        this.enableEagerLoading = false;
        this.enableStaticAnalysis = false;
        this.createRouteConfigInstruction = null;
        this.ownRoutes = [];
        this.childRoutes = [];
        this.filterChildRoutes = null;
        this.areChildRoutesLoaded = false;
        this.areOwnRoutesLoaded = false;
        this.isConfiguringRouter = false;
        this.isRouterConfigured = false;
        this.parents = new Set();
        this.router = null;
    }
    /**
     * The first (primary) parent of this route
     */
    get parent() {
        return this.parents.keys().next().value || null;
    }
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
     * If there is a `routeConfigModuleIds` property present on the instruction,
     * or the target has a `configureRouter()` method, it will be initialized as `configureRouter`, otherwise as `routeConfig`
     * @param instruction Instruction containing the parameters passed to the `@configureRouter` decorator
     */
    initialize(instruction) {
        if (!instruction) {
            if (this.isRouteConfig && this.isConfigureRouter) {
                return; // already configured
            }
            // We're not being called from a decorator, so just apply defaults as if we're a @routeConfig
            // tslint:disable-next-line:no-parameter-reassignment
            instruction = this.ensureCreateRouteConfigInstruction();
        }
        const settings = this.getSettings(instruction);
        const target = instruction.target;
        if (isConfigureRouterInstruction(instruction)) {
            if (this.isConfigureRouter) {
                return; // already configured
            }
            logger.debug(`initializing @configureRouter for ${target.name}`);
            this.isConfigureRouter = true;
            const configureInstruction = instruction;
            this.routeConfigModuleIds = ensureArray(configureInstruction.routeConfigModuleIds);
            this.filterChildRoutes = settings.filterChildRoutes;
            this.enableEagerLoading = settings.enableEagerLoading;
            this.enableStaticAnalysis = settings.enableStaticAnalysis;
            assignOrProxyPrototypeProperty(target.prototype, "configureRouter", RouterResource.originalConfigureRouterSymbol, configureRouter);
        }
        else {
            if (this.isRouteConfig) {
                return; // already configured
            }
            logger.debug(`initializing @routeConfig for ${target.name}`);
            this.isRouteConfig = true;
            const configInstruction = instruction;
            this.createRouteConfigInstruction = Object.assign({}, configInstruction, { settings });
        }
    }
    /**
     * Ensures that the module for this resources is loaded and registered so that its routing information can be queried.
     */
    async load() {
        const registry = this.getRegistry();
        const loader = this.getResourceLoader();
        if (!this.moduleId) {
            this.moduleId = registry.registerModuleViaConstructor(this.target).moduleId;
        }
        await loader.loadRouterResource(this.moduleId);
    }
    async loadOwnRoutes() {
        if (this.areOwnRoutesLoaded) {
            return this.ownRoutes;
        }
        // If we're in this method then it can never be the root, so it's always safe to apply @routeConfig initialization
        if (!this.isRouteConfig) {
            this.isRouteConfig = true;
            this.initialize();
        }
        const instruction = this.ensureCreateRouteConfigInstruction();
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
        this.router = router !== undefined ? router : null;
        if (this.areChildRoutesLoaded) {
            return this.childRoutes;
        }
        logger.debug(`loading childRoutes for ${this.target.name}`);
        const loader = this.getResourceLoader();
        let extractedChildRoutes;
        if (this.enableStaticAnalysis) {
            extractedChildRoutes = await this.getConfigFactory().createChildRouteConfigs({ target: this.target });
            for (const extracted of extractedChildRoutes) {
                if (extracted.moduleId) {
                    if (this.routeConfigModuleIds.indexOf(extracted.moduleId) === -1) {
                        this.routeConfigModuleIds.push(extracted.moduleId);
                    }
                    await loader.loadRouterResource(extracted.moduleId);
                }
            }
        }
        for (const moduleId of this.routeConfigModuleIds) {
            const resource = await loader.loadRouterResource(moduleId);
            const childRoutes = await resource.loadOwnRoutes();
            resource.parents.add(this);
            if (resource.isConfigureRouter && this.enableEagerLoading) {
                await resource.loadChildRoutes();
            }
            const childRoutesToProcess = [];
            if (this.enableStaticAnalysis) {
                const couples = alignRouteConfigs(childRoutes, extractedChildRoutes);
                for (const couple of couples) {
                    if (couple.left) {
                        const childRoute = couple.left;
                        if (couple.right) {
                            Object.assign(childRoute, Object.assign({}, couple.right, { settings: Object.assign({}, childRoute.settings, couple.right.settings) }));
                        }
                        childRoutesToProcess.push(childRoute);
                    }
                }
            }
            else {
                childRoutesToProcess.push(...childRoutes);
            }
            for (const childRoute of childRoutesToProcess) {
                if (!this.filterChildRoutes || (await this.filterChildRoutes(childRoute, childRoutes, this))) {
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
        await this.load();
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
        const originalConfigureRouter = this.target.prototype[RouterResource.originalConfigureRouterSymbol];
        if (originalConfigureRouter !== undefined) {
            if (this.enableStaticAnalysis) {
                Object.defineProperty(config, RouterResource.routerResourceSymbol, {
                    enumerable: false,
                    configurable: true,
                    writable: true,
                    value: this
                });
                Object.defineProperty(config, RouterResource.originalMapSymbol, {
                    enumerable: false,
                    configurable: true,
                    writable: true,
                    value: config.map
                });
                Object.defineProperty(config, "map", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: map.bind(config)
                });
            }
            return originalConfigureRouter.call(viewModel, config, router);
        }
    }
    ensureCreateRouteConfigInstruction() {
        const instruction = this.createRouteConfigInstruction || (this.createRouteConfigInstruction = {});
        instruction.target = instruction.target || this.target;
        instruction.moduleId = instruction.moduleId || this.moduleId;
        instruction.settings = instruction.settings || this.getSettings(instruction);
        return instruction;
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
    getRegistry() {
        return RouterMetadataConfiguration.INSTANCE.getRegistry(this.container);
    }
}
RouterResource.originalConfigureRouterSymbol = Symbol("configureRouter");
RouterResource.originalMapSymbol = Symbol("map");
RouterResource.viewModelSymbol = Symbol("viewModel");
RouterResource.routerResourceSymbol = Symbol("routerResource");
function isConfigureRouterInstruction(instruction) {
    return (!!instruction.routeConfigModuleIds ||
        Object.prototype.hasOwnProperty.call(instruction.target.prototype, "configureRouter"));
}
function ensureArray(value) {
    if (value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}
function assignPaths(routes) {
    for (const route of routes.filter((r) => !r.settings.path)) {
        const parentPath = route.settings.parentRoute ? route.settings.parentRoute.settings.path : "";
        const pathProperty = route.settings.pathProperty || "route";
        const path = route[pathProperty];
        route.settings.path = `${parentPath}/${path}`.replace(/\/\//g, "/").replace(/^\//, "");
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
        Object.defineProperty(proto, refSymbol, { enumerable: false, configurable: true, writable: true, value: original });
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
function map(originalConfigs) {
    const resource = this[RouterResource.routerResourceSymbol];
    const splittedOriginalConfigs = new RouteConfigSplitter().execute(ensureArray(originalConfigs));
    const couples = alignRouteConfigs(resource.childRoutes, splittedOriginalConfigs);
    const remainingConfigs = [];
    for (const couple of couples) {
        if (couple.left && couple.right) {
            Object.assign(couple.left, Object.assign({}, couple.right, { settings: Object.assign({}, couple.left.settings, couple.right.settings) }));
        }
        else if (couple.right) {
            remainingConfigs.push(couple.right);
        }
    }
    // tslint:disable-next-line:no-parameter-reassignment
    originalConfigs = remainingConfigs;
    return this;
}
function mergeRouterConfiguration(target, source) {
    target.instructions = (target.instructions || []).concat(source.instructions || []);
    target.options = Object.assign({}, (target.options || {}), (source.options || {}));
    target.pipelineSteps = (target.pipelineSteps || []).concat(source.pipelineSteps || []);
    target.title = source.title;
    target.unknownRouteConfig = source.unknownRouteConfig;
    target.viewPortDefaults = Object.assign({}, (target.viewPortDefaults || {}), (source.viewPortDefaults || {}));
    return target;
}
function alignRouteConfigs(leftList, rightList) {
    // we're essentially doing an OUTER JOIN here
    const couples = leftList.map(left => {
        const couple = {
            left
        };
        let rightMatches = rightList.filter(r => r.moduleId === left.moduleId);
        if (rightMatches.length > 1) {
            rightMatches = rightMatches.filter(r => r.route === left.route);
            if (rightMatches.length > 1) {
                rightMatches = rightMatches.filter(r => r.name === left.name);
                if (rightMatches.length > 1) {
                    rightMatches = rightMatches.filter(r => r.href === left.href);
                }
            }
        }
        if (rightMatches.length > 1) {
            // really shouldn't be possible
            throw new Error(`Probable duplicate routes found: ${JSON.stringify(rightMatches)}`);
        }
        if (rightMatches.length === 1) {
            couple.right = rightMatches[0];
        }
        return couple;
    });
    for (const right of rightList) {
        if (!couples.some(c => c.right === right)) {
            couples.push({ right });
        }
    }
    return couples;
}
