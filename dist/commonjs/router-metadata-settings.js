"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noTransform = (configs) => configs;
const noFilter = () => true;
const defaults = {
    nav: true
};
const overrides = {};
/**
 * All available aurelia-router-metadata settings
 */
class RouterMetadataSettings {
    constructor() {
        this.routeConfigDefaults = defaults;
        this.routeConfigOverrides = overrides;
        this.transformRouteConfigs = noTransform;
        this.filterChildRoutes = noFilter;
    }
}
exports.RouterMetadataSettings = RouterMetadataSettings;
//# sourceMappingURL=router-metadata-settings.js.map