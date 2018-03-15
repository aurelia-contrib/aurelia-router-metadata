import {
  IConfigureRouterInstruction,
  IRouteConfig,
  IRouteConfigInstruction,
  IRouterResourceTarget
} from "./interfaces";
import { RouterMetadataSettings } from "./router-metadata-configuration";
import { RouterResource } from "./router-resource";

/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routesOrInstruction One or more RouteConfig objects whose properties will override the convention defaults,
 * or an instruction object containing this decorators' parameters as properties
 * @param overrideSettings A settings object to override the global RouterMetadataSettings for this resource
 */
export function routeConfig(
  routesOrInstruction?: (IRouteConfig | IRouteConfig[]) | IRouteConfigInstruction,
  overrideSettings?: RouterMetadataSettings
): ClassDecorator {
  return (target: IRouterResourceTarget): void => {
    let instruction: IRouteConfigInstruction;
    if (
      Object.prototype.toString.call(routesOrInstruction) === "[object Object]" &&
      (routesOrInstruction as any).target
    ) {
      instruction = routesOrInstruction as IRouteConfigInstruction;
    } else {
      instruction = {
        target,
        routes: routesOrInstruction as IRouteConfig | IRouteConfig[],
        settings: overrideSettings
      };
    }
    RouterResource.ROUTE_CONFIG(instruction);
  };
}

/**
 * Decorator: Indicates that the decorated class should map RouteConfigs defined by the referenced moduleIds.
 * @param routeConfigModuleIdsOrInstruction A single or array of `PLATFORM.moduleName("")`,
 * or an instruction object containing this decorators' parameters as properties
 * @param overrideSettings A settings object to override the global RouterMetadataSettings for this resource
 */
export function configureRouter(
  routeConfigModuleIdsOrInstruction: (string | string[]) | IConfigureRouterInstruction,
  overrideSettings?: RouterMetadataSettings
): ClassDecorator {
  return (target: IRouterResourceTarget): void => {
    let instruction: IConfigureRouterInstruction;
    if (
      Object.prototype.toString.call(routeConfigModuleIdsOrInstruction) === "[object Object]" &&
      (routeConfigModuleIdsOrInstruction as any).target
    ) {
      instruction = routeConfigModuleIdsOrInstruction as IConfigureRouterInstruction;
    } else {
      instruction = {
        target,
        routeConfigModuleIds: routeConfigModuleIdsOrInstruction as string | string[],
        settings: overrideSettings
      };
    }
    RouterResource.CONFIGURE_ROUTER(instruction);
  };
}
