import { getLogger } from "aurelia-logging";
import { metadata } from "aurelia-metadata";
import { RoutableResource } from "./routable-resource";
import { getHyphenatedName, getModuleId } from "./utils";
const logger = getLogger("routable");
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
export function routable(routes, baseRoute) {
    return (target) => {
        const moduleId = getModuleId(target);
        RoutableResource.setTarget(moduleId, target);
        logger.debug(`loading routable for ${moduleId}`);
        const hyphenated = getHyphenatedName(target);
        let defaults = {
            route: hyphenated,
            name: hyphenated,
            title: target.name,
            nav: true,
            settings: {},
            moduleId: moduleId
        };
        defaults = Object.assign({}, defaults, getDefaults(target));
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
    if (target === functionProto) {
        return {};
    }
    const proto = Object.getPrototypeOf(target);
    let defaults = getDefaults(proto);
    for (const prop of routeConfigProperies) {
        if (target.hasOwnProperty(prop)) {
            defaults[prop] = target[prop];
        }
    }
    if (target.hasOwnProperty("routeName")) {
        defaults.name = target.routeName;
    }
    if (target.hasOwnProperty("baseRoute")) {
        defaults = Object.assign({}, defaults, target.baseRoute);
    }
    return defaults;
}
//# sourceMappingURL=routable.js.map