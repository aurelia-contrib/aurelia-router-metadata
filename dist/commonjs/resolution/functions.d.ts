import { IRouteConfig } from "../interfaces";
import { $Constructor } from "../model";
import { IBuilderContext, IFunction, IPropertyQuery } from "./interfaces";
/**
 * Function that simply wraps the provided value in a promise.
 */
export declare class PromisifyFunction implements IFunction {
    execute(result: any, _: IBuilderContext): any;
}
/**
 * Builder that will make sure the specified property name will always be an object.
 */
export declare class EnsureObjectPropertyFunction implements IFunction {
    propertyName: string;
    constructor(propertyName: string);
    execute(result: any, _: IBuilderContext): any;
}
/**
 * Function that uses cherow to parse the body of the first function returned by the PropertyQuery,
 * and then returns the FunctionDeclaration out of the parsed result.
 */
export declare class FunctionBodyParser implements IFunction {
    query: IPropertyQuery;
    constructor(query: IPropertyQuery);
    execute(request: $Constructor): any;
}
export declare class RouteConfigSplitter implements IFunction {
    execute(configs: IRouteConfig[]): IRouteConfig[];
}
