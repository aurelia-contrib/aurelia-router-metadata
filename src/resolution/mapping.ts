export enum MapStrategy {
  keepExisting,
  overwrite,
  assign,
  arrayConcat,
  stringConcat
}

export class RouteConfigPropertyMapper {
  public mappings: RouteConfigPropertyMapping[];

  constructor(mappings: RouteConfigPropertyMapping[] = []) {
    this.mappings = mappings;
  }

  public addMapping(sourceName: string, targetName: string, strategy: MapStrategy): RouteConfigPropertyMapper {
    this.mappings.push(new RouteConfigPropertyMapping(sourceName, targetName, strategy));

    return this;
  }

  public map(targetObj: any, sourceObj: any): void {
    const target = targetObj;
    const source = { ...sourceObj };
    for (const mapping of this.mappings) {
      const { targetName, sourceName } = mapping;
      if (source[sourceName] === undefined) {
        continue;
      }

      switch (mapping.strategy) {
        case MapStrategy.keepExisting: {
          if (target[targetName] === undefined) {
            target[targetName] = source[sourceName];
          }
          break;
        }
        case MapStrategy.overwrite: {
          target[targetName] = source[sourceName];
          break;
        }
        case MapStrategy.assign: {
          target[targetName] = { ...target[targetName], ...source[sourceName] };
          break;
        }
        case MapStrategy.arrayConcat: {
          if (!target[targetName]) {
            target[targetName] = [];
          }
          target[targetName] = target[targetName].concat(source[sourceName]);
          break;
        }
        case MapStrategy.stringConcat: {
          if (!target[targetName]) {
            target[targetName] = "";
          }
          target[targetName] = target[targetName].concat(source[sourceName]);
          break;
        }
        default: {
          throw new Error(`Unknown MapStrategy ${mapping.strategy}`);
        }
      }
    }
  }

  public clone(): RouteConfigPropertyMapper {
    return new RouteConfigPropertyMapper(this.mappings);
  }
}

export class RouteConfigPropertyMapping {
  public sourceName: string;
  public targetName: string;
  public strategy: MapStrategy;

  constructor(sourceName: string, targetName: string, strategy: MapStrategy) {
    this.sourceName = sourceName;
    this.targetName = targetName;
    this.strategy = strategy;
  }
}

const commonRouteConfigMapper = new RouteConfigPropertyMapper()
  .addMapping("route", "route", MapStrategy.overwrite)
  .addMapping("moduleId", "moduleId", MapStrategy.overwrite)
  .addMapping("redirect", "redirect", MapStrategy.overwrite)
  .addMapping("navigationStrategy", "navigationStrategy", MapStrategy.overwrite)
  .addMapping("viewPorts", "viewPorts", MapStrategy.overwrite)
  .addMapping("nav", "nav", MapStrategy.overwrite)
  .addMapping("href", "href", MapStrategy.overwrite)
  .addMapping("generationUsesHref", "generationUsesHref", MapStrategy.overwrite)
  .addMapping("title", "title", MapStrategy.overwrite)
  .addMapping("settings", "settings", MapStrategy.assign)
  .addMapping("navModel", "navModel", MapStrategy.overwrite)
  .addMapping("caseSensitive", "caseSensitive", MapStrategy.overwrite)
  .addMapping("activationStrategy", "activationStrategy", MapStrategy.overwrite)
  .addMapping("layoutView", "layoutView", MapStrategy.overwrite)
  .addMapping("layoutViewModel", "layoutViewModel", MapStrategy.overwrite)
  .addMapping("layoutModel", "layoutModel", MapStrategy.overwrite);

export const constructorRouteConfigMapper = commonRouteConfigMapper
  .clone()
  .addMapping("routeName", "name", MapStrategy.overwrite);

export const objectRouteConfigMapper = commonRouteConfigMapper
  .clone()
  .addMapping("name", "name", MapStrategy.overwrite);
