define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Class that creates RouteConfigs for the @routeConfig() decorator
     */
    class RouteConfigFactory {
    }
    exports.RouteConfigFactory = RouteConfigFactory;
    /**
     * The default RouteConfig factory
     */
    class DefaultRouteConfigFactory extends RouteConfigFactory {
        /**
         * Creates `RouteConfig` objects based on the provided instruction
         *
         * @param instruction Instruction containing all information based on which the `RouteConfig` objects
         * will be created
         */
        createRouteConfigs(instruction) {
            const { target, routes, moduleId, settings } = instruction;
            const configs = [];
            const settingsDefaults = Object.assign({}, (settings.routeConfigDefaults || {}));
            const conventionDefaults = Object.assign({}, getNameConventionDefaults(target));
            const prototypeDefaults = getPrototypeDefaults(target);
            const defaults = Object.assign({}, settingsDefaults, conventionDefaults, prototypeDefaults);
            const prototypeRoutes = ensureArray(target.routes);
            const argumentRoutes = ensureArray(routes);
            const baseConfigs = [...prototypeRoutes, ...argumentRoutes];
            if (baseConfigs.length === 0) {
                baseConfigs.push(defaults);
            }
            const overrides = Object.assign({}, (settings.routeConfigOverrides || {}));
            for (const baseConfig of baseConfigs) {
                const config = Object.assign({}, defaults, baseConfig, overrides);
                config.settings = config.settings || {};
                config.moduleId = moduleId;
                config.route = ensureArray(config.route);
                for (const route of config.route) {
                    configs.push(Object.assign({}, config, { route }));
                }
            }
            return settings.transformRouteConfigs(configs, instruction);
        }
    }
    exports.DefaultRouteConfigFactory = DefaultRouteConfigFactory;
    function ensureArray(value) {
        if (value === undefined) {
            return [];
        }
        return Array.isArray(value) ? value : [value];
    }
    function getNameConventionDefaults(target) {
        const hyphenated = hyphenate(target.name);
        return {
            route: hyphenated,
            name: hyphenated,
            title: toTitle(target.name)
        };
    }
    function getPrototypeDefaults(target) {
        // start with the first up in the prototype chain and override any properties we come across down the chain
        if (target === Function.prototype) {
            return {};
        }
        const proto = Object.getPrototypeOf(target);
        let config = getPrototypeDefaults(proto);
        // first grab any static "RouteConfig-like" properties from the target
        for (const prop of routeConfigProperies) {
            if (target.hasOwnProperty(prop)) {
                config[prop] = target[prop];
            }
        }
        if (target.hasOwnProperty("routeName")) {
            config.name = target.routeName;
        }
        // then override them with any properties on the target's baseRoute property (if present)
        if (target.hasOwnProperty("baseRoute")) {
            config = Object.assign({}, config, target.baseRoute);
        }
        return config;
    }
    function hyphenate(value) {
        return (value.charAt(0).toLowerCase() + value.slice(1)).replace(/([A-Z])/g, (char) => `-${char.toLowerCase()}`);
    }
    function toTitle(value) {
        return value.replace(/([A-Z])/g, (char) => ` ${char}`).trimLeft();
    }
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
});
