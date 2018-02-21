const noTransform = (configs) => configs;
const noFilter = () => true;
const defaults = {
    nav: true
};
const overrides = {};
/**
 * All available aurelia-router-metadata settings
 */
export class RouterMetadataSettings {
    constructor() {
        this.routeConfigDefaults = defaults;
        this.routeConfigOverrides = overrides;
        this.transformRouteConfigs = noTransform;
        this.filterChildRoutes = noFilter;
    }
}
//# sourceMappingURL=router-metadata-settings.js.map