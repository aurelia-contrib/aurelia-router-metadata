var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "aurelia-dependency-injection", "aurelia-loader", "aurelia-metadata", "./routable-resource", "./utils"], function (require, exports, aurelia_dependency_injection_1, aurelia_loader_1, aurelia_metadata_1, routable_resource_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const configureRouterSymbol = Symbol("configureRouter");
    const metadataKey = routable_resource_1.RoutableResource.routableResourceMetadataKey;
    /**
     * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
     * @param moduleId A single or array of `PLATFORM.moduleName("")`
     * @param eagerLoadChildRoutes Whether the routes' childRoutes should also be mapped during `configureRouter`
     * @param filter A filter to determine which routes to map
     */
    function mapRoutables(moduleId, eagerLoadChildRoutes = false, filter) {
        return (target) => {
            const ownModuleId = utils_1.getModuleId(target);
            routable_resource_1.RoutableResource.setTarget(ownModuleId, target);
            const resource = aurelia_metadata_1.metadata.getOrCreateOwn(metadataKey, routable_resource_1.RoutableResource, target);
            const loadChildRoutes = () => __awaiter(this, void 0, void 0, function* () {
                if (Array.isArray(resource.childRoutes)) {
                    return resource.childRoutes;
                }
                const filterRoute = (typeof filter === "object" ? filter : () => true);
                const moduleIds = Array.isArray(moduleId) ? moduleId : [moduleId];
                const loader = aurelia_dependency_injection_1.Container.instance.get(aurelia_loader_1.Loader);
                yield loader.loadAllModules(moduleIds);
                const routes = [];
                for (const id of moduleIds) {
                    const trg = routable_resource_1.RoutableResource.getTarget(id);
                    if (trg === undefined) {
                        throw new Error(`Unable to resolve routable for module '${id}' (requested by: '${ownModuleId}').
            Routes registered through @mapRoutables must have a corresponding @routable on the referenced component.`);
                    }
                    const res = aurelia_metadata_1.metadata.getOwn(metadataKey, trg);
                    for (const route of res.routes) {
                        if (filterRoute(route)) {
                            routes.push(route);
                        }
                    }
                    if (eagerLoadChildRoutes && res.loadChildRoutes !== undefined) {
                        const childRoutes = yield res.loadChildRoutes();
                        for (const route of routes) {
                            route.settings.childRoutes = childRoutes;
                        }
                    }
                }
                resource.childRoutes = routes;
                return routes;
            });
            resource.moduleId = ownModuleId;
            resource.loadChildRoutes = loadChildRoutes;
            if ("configureRouter" in target.prototype) {
                const originalConfigureRouter = target.prototype.configureRouter;
                target.prototype[configureRouterSymbol] = originalConfigureRouter;
            }
            target.prototype.configureRouter = configureRouter;
        };
    }
    exports.mapRoutables = mapRoutables;
    function configureRouter(config, router) {
        return __awaiter(this, void 0, void 0, function* () {
            // tslint:disable-next-line
            const context = this;
            const target = context.constructor;
            const resource = aurelia_metadata_1.metadata.getOwn(metadataKey, target);
            const routes = yield resource.loadChildRoutes();
            config.map(routes);
            const originalConfigureRouter = context[configureRouterSymbol];
            if (originalConfigureRouter !== undefined) {
                return originalConfigureRouter.call(context, config, router);
            }
        });
    }
});
//# sourceMappingURL=map-routables.js.map