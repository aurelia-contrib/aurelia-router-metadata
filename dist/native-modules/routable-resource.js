var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getLogger } from "aurelia-logging";
import { PLATFORM } from "aurelia-pal";
import { routerMetadata } from "./router-metadata";
const configureRouterSymbol = Symbol("configureRouter");
const logger = getLogger("router-metadata");
const routeConfigProperies = [
    "route",
    "moduleId",
    "redirect",
    "navigationStrategy",
    "viewPorts",
    "nav",
    "href",
    "generationUsesHref",
    "title",
    "settings",
    "navModel",
    "caseSensitive",
    "activationStrategy",
    "layoutView",
    "layoutViewModel",
    "layoutModel"
];
/**
 * Identifies a class as a resource that can be navigated to (has routes) and/or
 * configures a router to navigate to other routes (maps routes)
 */
export class RoutableResource {
    get instance() {
        return this.router ? this.router.container.viewModel : null;
    }
    constructor(moduleId, target) {
        this.ownModuleId = moduleId;
        this.ownTarget = target;
        this.isRoutable = false;
        this.isMapRoutables = false;
        this.routableModuleIds = [];
        this.enableEagerLoading = false;
        this.ownRoutes = [];
        this.childRoutes = [];
        this.filterChildRoutes = () => true;
        this.areChildRoutesLoaded = false;
        this.areChildRouteModulesLoaded = false;
        this.isRouterConfigured = false;
        this.router = null;
    }
    static ROUTABLE(instruction, existing) {
        const { target, routes, baseRoute } = instruction;
        const resource = existing || routerMetadata.getOrCreateOwn(target);
        const moduleId = resource.ownModuleId;
        logger.debug(`initializing @routable for ${moduleId}`);
        resource.isRoutable = true;
        // convention defaults
        const hyphenated = getHyphenatedName(target);
        let defaults = {
            route: hyphenated,
            name: hyphenated,
            title: target.name,
            nav: true,
            settings: {},
            moduleId: moduleId
        };
        // static property defaults
        defaults = Object.assign({}, defaults, getRouteDefaults(target));
        // argument defaults
        if (baseRoute) {
            defaults = Object.assign({}, defaults, baseRoute);
        }
        const staticRoutes = target.routes;
        if (staticRoutes) {
            for (const route of Array.isArray(staticRoutes) ? staticRoutes : [staticRoutes]) {
                resource.ownRoutes.push(Object.assign({}, defaults, route));
            }
        }
        if (routes) {
            for (const route of Array.isArray(routes) ? routes : [routes]) {
                resource.ownRoutes.push(Object.assign({}, defaults, route));
            }
        }
        // if no routes defined, simply add one route with the default values
        if (resource.ownRoutes.length === 0) {
            resource.ownRoutes.push(Object.assign({}, defaults));
        }
        for (const route of resource.ownRoutes) {
            route.settings.routableResource = resource;
        }
        return resource;
    }
    static MAP_ROUTABLES(instruction, existing) {
        const { target, routableModuleIds, eagerLoadChildRoutes, filter } = instruction;
        const resource = existing || routerMetadata.getOrCreateOwn(target);
        const moduleId = resource.ownModuleId;
        logger.debug(`initializing @routable for ${moduleId}`);
        resource.isMapRoutables = true;
        resource.routableModuleIds = Array.isArray(routableModuleIds) ? routableModuleIds : [routableModuleIds];
        resource.filterChildRoutes = filter || resource.filterChildRoutes;
        resource.enableEagerLoading = eagerLoadChildRoutes === true;
        const proto = target.prototype;
        if ("configureRouter" in proto) {
            let configureRouterProto = proto;
            while (!configureRouterProto.hasOwnProperty("configureRouter")) {
                configureRouterProto = Object.getPrototypeOf(configureRouterProto);
            }
            const originalConfigureRouter = configureRouterProto.configureRouter;
            proto[configureRouterSymbol] = originalConfigureRouter;
        }
        proto.configureRouter = configureRouter;
        return resource;
    }
    loadChildRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.areChildRoutesLoaded) {
                return this.childRoutes;
            }
            logger.debug(`loading routes from child @routables for ${this.ownModuleId}`);
            yield this.loadChildRouteModules();
            for (const moduleId of this.routableModuleIds) {
                const resource = routerMetadata.getOwn(moduleId);
                if (resource.isMapRoutables && this.enableEagerLoading) {
                    yield resource.loadChildRoutes();
                }
                for (const route of resource.ownRoutes.filter(this.filterChildRoutes)) {
                    this.childRoutes.push(route);
                }
            }
            if (this.isRoutable) {
                for (const route of this.ownRoutes) {
                    route.settings.childRoutes = this.childRoutes;
                    for (const childRoute of this.childRoutes) {
                        childRoute.settings.parentRoute = route;
                    }
                }
            }
            this.areChildRoutesLoaded = true;
            return this.childRoutes;
        });
    }
    loadChildRouteModules() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.areChildRouteModulesLoaded) {
                return;
            }
            yield PLATFORM.Loader.loadAllModules(this.routableModuleIds);
            if (this.enableEagerLoading) {
                for (const moduleId of this.routableModuleIds) {
                    const resource = routerMetadata.getOwn(moduleId);
                    if (resource.isMapRoutables) {
                        yield resource.loadChildRouteModules();
                    }
                }
            }
            this.areChildRouteModulesLoaded = true;
        });
    }
    configureRouter(config, router) {
        return __awaiter(this, void 0, void 0, function* () {
            const routes = yield this.loadChildRoutes();
            config.map(routes);
            this.router = router;
            this.isRouterConfigured = true;
            const originalConfigureRouter = this.ownTarget.prototype[configureRouterSymbol];
            if (originalConfigureRouter !== undefined) {
                return originalConfigureRouter.call(router.container.viewModel, config, router);
            }
        });
    }
}
// tslint:disable:no-invalid-this
function configureRouter(config, router) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = Object.getPrototypeOf(this).constructor;
        const resource = routerMetadata.getOwn(target);
        yield resource.configureRouter(config, router);
    });
}
// tslint:enable:no-invalid-this
function getRouteDefaults(target) {
    // start with the first up in the prototype chain and override any properties we come across down the chain
    if (target === Function.prototype) {
        return {};
    }
    const proto = Object.getPrototypeOf(target);
    let defaults = getRouteDefaults(proto);
    // first grab any static "RouteConfig-like" properties from the target
    for (const prop of routeConfigProperies) {
        if (target.hasOwnProperty(prop)) {
            defaults[prop] = target[prop];
        }
    }
    if (target.hasOwnProperty("routeName")) {
        defaults.name = target.routeName;
    }
    // then override them with any properties on the target's baseRoute property (if present)
    if (target.hasOwnProperty("baseRoute")) {
        defaults = Object.assign({}, defaults, target.baseRoute);
    }
    return defaults;
}
function getHyphenatedName(target) {
    const name = target.name;
    return (name.charAt(0).toLowerCase() + name.slice(1)).replace(/([A-Z])/g, (char) => `-${char.toLowerCase()}`);
}
//# sourceMappingURL=routable-resource.js.map