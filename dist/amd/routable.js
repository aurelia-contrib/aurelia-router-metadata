var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "aurelia-logging", "aurelia-metadata", "./routable-resource", "./utils"], function (require, exports, aurelia_logging_1, aurelia_metadata_1, routable_resource_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var logger = aurelia_logging_1.getLogger("routable");
    var routeConfigProperies = [
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
    var functionProto = Object.getPrototypeOf(Function);
    var metadataKey = routable_resource_1.RoutableResource.routableResourceMetadataKey;
    function routable(routes, baseRoute) {
        return function (target) {
            var moduleId = utils_1.getModuleId(target);
            routable_resource_1.RoutableResource.setTarget(moduleId, target);
            logger.debug("loading routable for " + moduleId);
            var hyphenated = utils_1.getHyphenatedName(target);
            var defaults = {
                route: hyphenated,
                name: hyphenated,
                title: target.name,
                nav: true,
                settings: {},
                moduleId: moduleId
            };
            defaults = __assign({}, defaults, getDefaults(target));
            if (baseRoute) {
                defaults = __assign({}, defaults, baseRoute);
            }
            var routesToAdd = [];
            if (target.routes) {
                for (var _i = 0, _a = Array.isArray(target.routes) ? target.routes : [target.routes]; _i < _a.length; _i++) {
                    var route = _a[_i];
                    routesToAdd.push(__assign({}, defaults, route));
                }
            }
            if (routes) {
                for (var _b = 0, _c = Array.isArray(routes) ? routes : [routes]; _b < _c.length; _b++) {
                    var route = _c[_b];
                    routesToAdd.push(__assign({}, defaults, route));
                }
            }
            if (routesToAdd.length === 0) {
                routesToAdd.push(__assign({}, defaults));
            }
            var resource = aurelia_metadata_1.metadata.getOrCreateOwn(metadataKey, routable_resource_1.RoutableResource, target);
            resource.moduleId = moduleId;
            resource.target = target;
            resource.routes = routesToAdd;
        };
    }
    exports.routable = routable;
    function getDefaults(target) {
        if (target === functionProto) {
            return {};
        }
        var proto = Object.getPrototypeOf(target);
        var defaults = getDefaults(proto);
        for (var _i = 0, routeConfigProperies_1 = routeConfigProperies; _i < routeConfigProperies_1.length; _i++) {
            var prop = routeConfigProperies_1[_i];
            if (target.hasOwnProperty(prop)) {
                defaults[prop] = target[prop];
            }
        }
        if (target.hasOwnProperty("routeName")) {
            defaults.name = target.routeName;
        }
        if (target.hasOwnProperty("baseRoute")) {
            defaults = __assign({}, defaults, target.baseRoute);
        }
        return defaults;
    }
});
//# sourceMappingURL=routable.js.map