export declare enum MapStrategy {
    keepExisting = 0,
    overwrite = 1,
    assign = 2,
    arrayConcat = 3,
    stringConcat = 4,
}
export declare class RouteConfigPropertyMapper {
    mappings: RouteConfigPropertyMapping[];
    constructor(mappings?: RouteConfigPropertyMapping[]);
    addMapping(sourceName: string, targetName: string, strategy: MapStrategy): RouteConfigPropertyMapper;
    map(targetObj: any, sourceObj: any): void;
    clone(): RouteConfigPropertyMapper;
}
export declare class RouteConfigPropertyMapping {
    sourceName: string;
    targetName: string;
    strategy: MapStrategy;
    constructor(sourceName: string, targetName: string, strategy: MapStrategy);
}
export declare const constructorRouteConfigMapper: RouteConfigPropertyMapper;
export declare const objectRouteConfigMapper: RouteConfigPropertyMapper;
