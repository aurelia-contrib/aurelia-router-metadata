import { getLogger, Logger } from "aurelia-logging";
import { metadata } from "aurelia-metadata";
import { RouteConfig } from "aurelia-router";
import { RoutableResource } from "./routable-resource";
import { getHyphenatedName, getModuleId } from "./utils";

const logger = getLogger("routable") as Logger;

// we're leaving "name" out because that's a reserved property which always returns the class name
const routeConfigProperies: string[] = [
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

const functionProto: any = Object.getPrototypeOf(Function);
const metadataKey: string = RoutableResource.routableResourceMetadataKey;

/**
 * Decorator: Indicates that the decorated class should define a `RouteConfig` for itself
 * @param routes One or more RouteConfig objects whose properties will override the convention defaults
 * @param baseRoute A RouteConfig object whose properties will override the convention defaults, but will be overridden by routes
 */
export function routable(
  routes?: RouteConfig | RouteConfig[],
  baseRoute?: RouteConfig
): ClassDecorator {
  return (target: any): any => {
    const moduleId = getModuleId(target);
    RoutableResource.setTarget(moduleId, target);

    logger.debug(`loading routable for ${moduleId}`);

    // convention defaults
    const hyphenated = getHyphenatedName(target);
    let defaults: RouteConfig = {
      route: hyphenated,
      name: hyphenated,
      title: target.name,
      nav: true,
      settings: {},
      moduleId: moduleId
    };

    // static property defaults
    defaults = { ...defaults, ...getDefaults(target) };

    // argument defaults
    if (baseRoute) {
      defaults = { ...defaults, ...baseRoute };
    }

    const routesToAdd = [] as RouteConfig[];
    if (target.routes) {
      for (const route of Array.isArray(target.routes) ? target.routes : [target.routes]) {
        routesToAdd.push({ ...defaults, ...route });
      }
    }
    if (routes) {
      for (const route of Array.isArray(routes) ? routes : [routes]) {
        routesToAdd.push({ ...defaults, ...route });
      }
    }
    // if no routes defined, simply add one route with the default values
    if (routesToAdd.length === 0) {
      routesToAdd.push({ ...defaults });
    }

    const resource = metadata.getOrCreateOwn(metadataKey, RoutableResource, target) as any as RoutableResource;
    resource.moduleId = moduleId;
    resource.target = target;
    resource.routes = routesToAdd;
  };
}

function getDefaults(target: any): RouteConfig {
  // start with the first up in the prototype chain and override any properties we come across down the chain
  if (target === functionProto) {
    return {} as any;
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
    defaults = { ...defaults, ...target.baseRoute };
  }

  return defaults;
}
