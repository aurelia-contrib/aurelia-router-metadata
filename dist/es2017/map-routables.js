import { Container } from "aurelia-dependency-injection";
import { Loader } from "aurelia-loader";
import { metadata } from "aurelia-metadata";
import { RoutableResource } from "./routable-resource";
import { getModuleId } from "./utils";
const configureRouterSymbol = Symbol("configureRouter");
const metadataKey = RoutableResource.routableResourceMetadataKey;
export function mapRoutables(moduleId, eagerLoadChildRoutes = false, filter) {
    return (target) => {
        const ownModuleId = getModuleId(target);
        RoutableResource.setTarget(ownModuleId, target);
        const resource = metadata.getOrCreateOwn(metadataKey, RoutableResource, target);
        const loadChildRoutes = async () => {
            if (Array.isArray(resource.childRoutes)) {
                return resource.childRoutes;
            }
            const filterRoute = (typeof filter === "object" ? filter : () => true);
            const moduleIds = Array.isArray(moduleId) ? moduleId : [moduleId];
            const loader = Container.instance.get(Loader);
            await loader.loadAllModules(moduleIds);
            const routes = [];
            for (const id of moduleIds) {
                const trg = RoutableResource.getTarget(id);
                if (trg === undefined) {
                    throw new Error(`Unable to resolve routable for module '${id}' (requested by: '${ownModuleId}').
            Routes registered through @mapRoutables must have a corresponding @routable on the referenced component.`);
                }
                const res = metadata.getOwn(metadataKey, trg);
                for (const route of res.routes) {
                    if (filterRoute(route)) {
                        routes.push(route);
                    }
                }
                if (eagerLoadChildRoutes && res.loadChildRoutes !== undefined) {
                    const childRoutes = await res.loadChildRoutes();
                    for (const route of routes) {
                        route.settings.childRoutes = childRoutes;
                    }
                }
            }
            resource.childRoutes = routes;
            return routes;
        };
        resource.moduleId = ownModuleId;
        resource.loadChildRoutes = loadChildRoutes;
        if ("configureRouter" in target.prototype) {
            const originalConfigureRouter = target.prototype.configureRouter;
            target.prototype[configureRouterSymbol] = originalConfigureRouter;
        }
        target.prototype.configureRouter = configureRouter;
    };
}
async function configureRouter(config, router) {
    const context = this;
    const target = context.constructor;
    const resource = metadata.getOwn(metadataKey, target);
    const routes = await resource.loadChildRoutes();
    config.map(routes);
    const originalConfigureRouter = context[configureRouterSymbol];
    if (originalConfigureRouter !== undefined) {
        return originalConfigureRouter.call(context, config, router);
    }
}
//# sourceMappingURL=map-routables.js.map