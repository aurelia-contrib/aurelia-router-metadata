"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MapStrategy;
(function (MapStrategy) {
    MapStrategy[MapStrategy["keepExisting"] = 0] = "keepExisting";
    MapStrategy[MapStrategy["overwrite"] = 1] = "overwrite";
    MapStrategy[MapStrategy["assign"] = 2] = "assign";
    MapStrategy[MapStrategy["arrayConcat"] = 3] = "arrayConcat";
    MapStrategy[MapStrategy["stringConcat"] = 4] = "stringConcat";
})(MapStrategy = exports.MapStrategy || (exports.MapStrategy = {}));
class RouteConfigPropertyMapper {
    constructor(mappings = []) {
        this.mappings = mappings;
    }
    addMapping(sourceName, targetName, strategy) {
        this.mappings.push(new RouteConfigPropertyMapping(sourceName, targetName, strategy));
        return this;
    }
    map(targetObj, sourceObj) {
        const target = targetObj;
        const source = Object.assign({}, sourceObj);
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
                    target[targetName] = Object.assign({}, target[targetName], source[sourceName]);
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
    clone() {
        return new RouteConfigPropertyMapper(this.mappings);
    }
}
exports.RouteConfigPropertyMapper = RouteConfigPropertyMapper;
class RouteConfigPropertyMapping {
    constructor(sourceName, targetName, strategy) {
        this.sourceName = sourceName;
        this.targetName = targetName;
        this.strategy = strategy;
    }
}
exports.RouteConfigPropertyMapping = RouteConfigPropertyMapping;
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
exports.constructorRouteConfigMapper = commonRouteConfigMapper
    .clone()
    .addMapping("routeName", "name", MapStrategy.overwrite);
exports.objectRouteConfigMapper = commonRouteConfigMapper
    .clone()
    .addMapping("name", "name", MapStrategy.overwrite);
