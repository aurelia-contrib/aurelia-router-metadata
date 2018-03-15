import { BlockStatement, CallExpression, ObjectExpression } from "@src/cherow/estree";
import { $Constructor } from "@src/model";
import { IPropertyQuery } from "@src/resolution/interfaces";
/**
 * Returns the "configureRouter" method from a class constructor or, if it's stored in a Symbol-keyed property
 * (meaning it's wrapped by a RouterResource), will return that Symbol-keyed backup instead (since that's where
 * we need the route information from)
 */
export declare class ConfigureRouterMethodQuery implements IPropertyQuery {
    selectProperties($constructor: $Constructor): any;
}
/**
 * Returns a list of CallExpressions from a BlockStatement where the name of the invoked method
 * matches the provided name.
 *
 * Example: the name "map" would return all xxx.map() expressions from a function block.
 */
export declare class BlockStatementCallExpressionCalleePropertyNameQuery implements IPropertyQuery {
    name: string;
    constructor(name: string);
    selectProperties(blockStatement: BlockStatement): any;
}
export declare class CallExpressionArgumentTypeQuery implements IPropertyQuery {
    typeNames: string[];
    constructor(typeNames: string[]);
    selectProperties(callExpression: CallExpression): any;
}
export declare class RouteConfigPropertyQuery implements IPropertyQuery {
    propertyNames: string[];
    constructor();
    selectProperties(objectExpression: ObjectExpression): any[];
}
export declare class LiteralArgumentValueCallExpressionQuery implements IPropertyQuery {
    selectProperties(callExpression: CallExpression): any;
}
