import { getLogger } from "aurelia-logging";
import { metadata } from "aurelia-metadata";
import { RoutableResource } from "./routable-resource";
import { getHyphenatedName, getModuleId } from "./utils";
const logger = getLogger("routable");
// we're leaving "name" out because that's a reserved property which always returns the class name
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
const functionProto = Object.getPrototypeOf(Function);
const metadataKey = RoutableResource.routableResourceMetadataKey;
/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routes One or more RouteConfig objects whose properties will override the convention defaults
 * @param baseRoute A RouteConfig object whose properties will override the convention defaults, but will be overridden by routes
 */
export function routable(routes, baseRoute) {
    return (target) => {
        const moduleId = getModuleId(target);
        RoutableResource.setTarget(moduleId, target);
        logger.debug(`loading routable for ${moduleId}`);
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
        defaults = Object.assign({}, defaults, getDefaults(target));
        // argument defaults
        if (baseRoute) {
            defaults = Object.assign({}, defaults, baseRoute);
        }
        const routesToAdd = [];
        if (target.routes) {
            for (const route of Array.isArray(target.routes) ? target.routes : [target.routes]) {
                routesToAdd.push(Object.assign({}, defaults, route));
            }
        }
        if (routes) {
            for (const route of Array.isArray(routes) ? routes : [routes]) {
                routesToAdd.push(Object.assign({}, defaults, route));
            }
        }
        // if no routes defined, simply add one route with the default values
        if (routesToAdd.length === 0) {
            routesToAdd.push(Object.assign({}, defaults));
        }
        const resource = metadata.getOrCreateOwn(metadataKey, RoutableResource, target);
        resource.moduleId = moduleId;
        resource.target = target;
        resource.routes = routesToAdd;
    };
}
function getDefaults(target) {
    // start with the first up in the prototype chain and override any properties we come across down the chain
    if (target === functionProto) {
        return {};
    }
    const proto = Object.getPrototypeOf(target);
    let defaults = getDefaults(proto);
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
//# sourceMappingURL=routable.js.map