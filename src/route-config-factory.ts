import { ICompleteRouteConfig, ICreateRouteConfigInstruction, IRouteConfig, IRouterResourceTarget } from "./interfaces";

const routeConfigProperties: string[] = [
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

/**
 * Class that creates RouteConfigs for the @routeConfig() decorator
 */
export abstract class RouteConfigFactory {
  public abstract createRouteConfigs(
    // tslint:disable-next-line:variable-name
    _instruction: ICreateRouteConfigInstruction
  ): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;
}

/**
 * The default RouteConfig factory
 */
export class DefaultRouteConfigFactory extends RouteConfigFactory {
  /**
   * Creates `RouteConfig` objects based on the provided instruction
   *
   * @param instruction Instruction containing all information based on which the `RouteConfig` objects
   * will be created
   */
  public createRouteConfigs(
    instruction: ICreateRouteConfigInstruction
  ): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]> {
    const { target, routes, moduleId, settings } = instruction;
    const configs: ICompleteRouteConfig[] = [];

    const settingsDefaults = { ...(settings.routeConfigDefaults || {}) };
    const conventionDefaults = { ...getNameConventionDefaults(target) };
    const prototypeDefaults = getPrototypeDefaults(target);
    const defaults = { ...settingsDefaults, ...conventionDefaults, ...prototypeDefaults };

    const prototypeRoutes = ensureArray(target.routes);
    const argumentRoutes = ensureArray(routes);
    const baseConfigs = [...prototypeRoutes, ...argumentRoutes];
    if (baseConfigs.length === 0) {
      baseConfigs.push(defaults);
    }

    const overrides = { ...(settings.routeConfigOverrides || {}) };
    for (const baseConfig of baseConfigs) {
      const config = { ...defaults, ...baseConfig, ...overrides };
      config.settings = config.settings || {};
      config.moduleId = moduleId;
      config.route = ensureArray(config.route);
      for (const route of config.route) {
        configs.push({ ...config, route });
      }
    }

    return settings.transformRouteConfigs(configs, instruction);
  }
}

function ensureArray<T>(value: T | null | undefined | T[]): T[] {
  if (value === null || value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function getNameConventionDefaults(target: IRouterResourceTarget): IRouteConfig {
  const hyphenated = hyphenate(target.name);

  return {
    route: hyphenated,
    name: hyphenated,
    title: toTitle(target.name)
  };
}

function getPrototypeDefaults(target: IRouterResourceTarget): IRouteConfig {
  // start with the first up in the prototype chain and override any properties we come across down the chain
  if (target === Function.prototype) {
    return {} as any;
  }
  const proto = Object.getPrototypeOf(target);
  let config = getPrototypeDefaults(proto);

  // first grab any static "RouteConfig-like" properties from the target
  for (const prop of routeConfigProperties) {
    if (target.hasOwnProperty(prop)) {
      config[prop] = target[prop];
    }
  }
  if (target.hasOwnProperty("routeName")) {
    config.name = target.routeName;
  }
  // then override them with any properties on the target's baseRoute property (if present)
  if (target.hasOwnProperty("baseRoute")) {
    config = { ...config, ...target.baseRoute };
  }

  return config;
}

function hyphenate(value: string): string {
  return (value.charAt(0).toLowerCase() + value.slice(1)).replace(
    /([A-Z])/g,
    (char: string) => `-${char.toLowerCase()}`
  );
}

function toTitle(value: string): string {
  return value.replace(/([A-Z])/g, (char: string) => ` ${char}`).trimLeft();
}
