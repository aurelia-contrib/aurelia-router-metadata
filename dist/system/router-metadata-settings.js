System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var noTransform, noFilter, defaults, overrides, RouterMetadataSettings;
    return {
        setters: [],
        execute: function () {
            noTransform = (configs) => configs;
            noFilter = () => true;
            defaults = {
                nav: true
            };
            overrides = {};
            /**
             * All available aurelia-router-metadata settings
             */
            RouterMetadataSettings = class RouterMetadataSettings {
                constructor() {
                    this.routeConfigDefaults = defaults;
                    this.routeConfigOverrides = overrides;
                    this.transformRouteConfigs = noTransform;
                    this.filterChildRoutes = noFilter;
                }
            };
            exports_1("RouterMetadataSettings", RouterMetadataSettings);
        }
    };
});
//# sourceMappingURL=router-metadata-settings.js.map