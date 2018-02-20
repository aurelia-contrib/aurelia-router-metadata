import { RouteConfig } from "aurelia-router";
import { IMapRoutablesInstruction, IRoutableInstruction, IRouteConfigInstruction } from "./interfaces";

const noTransform = (configs: RouteConfig[]): RouteConfig[] => configs;
const noFilter = (): boolean => true;
const defaults = {
  nav: true
};
const overrides = {};

/**
 * All available aurelia-router-metadata settings
 */
export class RouterMetadataSettings {
  [setting: string]: any;

  /**
   * The initial settings to use for each route before class-based conventions are applied
   */
  public routeConfigDefaults: RouteConfig;

  /**
   * RouteConfig settings that will be applied last before transformation; these settings will override all other defaults and arguments
   */
  public routeConfigOverrides: RouteConfig;

  /**
   * Perform any final modifications on the routes just before they are stored in the metadata
   * @param configs The route configs that were created by the @routable() decorator
   * @param configInstruction The original configuration instruction that the decorator passed on to RoutableResource
   */
  public transformRouteConfigs: (configs: RouteConfig[], configInstruction: IRouteConfigInstruction) => RouteConfig[];

  /**
   * Filter which routes from a @routable are added to a @mapRoutables' childRoutes
   */
  public filterChildRoutes: (
    config: RouteConfig,
    allConfigs: RouteConfig[],
    mapInstruction: IMapRoutablesInstruction
  ) => boolean;

  /**
   * Enable/disable eager loading by default
   */
  public enableEagerLoading: boolean;

  constructor() {
    this.routeConfigDefaults = defaults as any;
    this.routeConfigOverrides = overrides as any;
    this.transformRouteConfigs = noTransform;
    this.filterChildRoutes = noFilter;
  }
}
