import { IRouteConfig } from "./interfaces";

export function allObjectKeys(obj: any): PropertyKey[] {
  const names = Object.getOwnPropertyNames(obj) as PropertyKey[];
  const symbols = Object.getOwnPropertySymbols(obj) as PropertyKey[];

  return names.concat(symbols);
}

export function ensureArray<T>(value: T | null | undefined | T[]): T[] {
  if (value === null || value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function splitRouteConfig(configs: IRouteConfig[]): IRouteConfig[] {
  if (configs.length === 0) {
    return configs;
  }
  const result: IRouteConfig[][] = [];
  for (const config of configs) {
    if (Object.prototype.hasOwnProperty.call(config, "route")) {
      if (/String/.test(Object.prototype.toString.call(config.route))) {
        result.push([config]);
      } else if (Array.isArray(config.route)) {
        if (config.route.length === 0) {
          delete config.route;

          result.push([config]);
        } else {
          result.push(config.route.map(r => ({ ...config, route: r })));
        }
      } else {
        delete config.route;

        result.push([config]);
      }
    } else {
      result.push([config]);
    }
  }

  return result.reduce((prev, cur) => prev.concat(cur));
}
