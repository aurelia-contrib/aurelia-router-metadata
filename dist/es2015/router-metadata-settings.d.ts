import { RouteConfig } from "aurelia-router";
import { IMapRoutablesInstruction, IRouteConfigInstruction } from "./interfaces";
/**
 * All available aurelia-router-metadata settings
 */
export declare class RouterMetadataSettings {
    [setting: string]: any;
    /**
     * The initial settings to use for each route before class-based conventions are applied
     */
    routeConfigDefaults: RouteConfig;
    /**
     * RouteConfig settings that will be applied last before transformation; these settings will override all other defaults and arguments
     */
    routeConfigOverrides: RouteConfig;
    /**
     * Perform any final modifications on the routes just before they are stored in the metadata
     * @param configs The route configs that were created by the @routable() decorator
     * @param configInstruction The original configuration instruction that the decorator passed on to RoutableResource
     */
    transformRouteConfigs: (configs: RouteConfig[], configInstruction: IRouteConfigInstruction) => RouteConfig[];
    /**
     * Filter which routes from a @routable are added to a @mapRoutables' childRoutes
     */
    filterChildRoutes: (config: RouteConfig, allConfigs: RouteConfig[], mapInstruction: IMapRoutablesInstruction) => boolean;
    /**
     * Enable/disable eager loading by default
     */
    enableEagerLoading: boolean;
    constructor();
}
