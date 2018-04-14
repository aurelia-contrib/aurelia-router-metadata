import { ESTree } from "cherow";
import { IConfigureRouterInstruction, ICreateRouteConfigInstruction, IRouterResourceTarget } from "../interfaces";
import { $Constructor, $Module } from "../model";
/**
 * Base RouteConfig request with the common ICreateRouteConfigInstruction property
 * needed by most RouteConfig-related builders.
 */
export declare abstract class RouteConfigRequest {
    instruction: ICreateRouteConfigInstruction;
    constructor(instruction: ICreateRouteConfigInstruction);
}
/**
 * Request that will only be resolved by the CompleteRouteConfigCollectionBuilder.
 */
export declare class CompleteRouteConfigCollectionRequest extends RouteConfigRequest {
    constructor(instruction: ICreateRouteConfigInstruction);
}
/**
 * Request that will only be resolved by the CompleteChildRouteConfigCollectionBuilder.
 */
export declare class CompleteChildRouteConfigCollectionRequest {
    instruction: IConfigureRouterInstruction;
    $module?: $Module;
    constructor(instruction: IConfigureRouterInstruction, $module?: $Module);
}
/**
 * Request that will only be resolved by thehildRouteConfigCollectionBuilder.
 */
export declare class ChildRouteConfigCollectionRequest {
    $constructor: $Constructor;
    constructor($constructor: $Constructor);
}
/**
 * Request that will only be resolved by the RouteConfigDefaultsBuilder.
 */
export declare class RouteConfigDefaultsRequest extends RouteConfigRequest {
    constructor(instruction: ICreateRouteConfigInstruction);
}
/**
 * Request that will only be resolved by the RouteConfigCollectionBuilder.
 */
export declare class RouteConfigCollectionRequest extends RouteConfigRequest {
    constructor(instruction: ICreateRouteConfigInstruction);
}
/**
 * Request that will only be resolved by the RouteConfigOverridesBuilder.
 */
export declare class RouteConfigOverridesRequest extends RouteConfigRequest {
    constructor(instruction: ICreateRouteConfigInstruction);
}
/**
 * Request that will only be resolved by the RouterMetadataSettingsProvider.
 */
export declare class RouterMetadataSettingsRequest {
    target: IRouterResourceTarget;
    constructor(target: IRouterResourceTarget);
}
/**
 * Request that will only be resolved by the RouterResourceProvider.
 */
export declare class RouterResourceRequest {
    target: IRouterResourceTarget;
    constructor(target: IRouterResourceTarget);
}
/**
 * Request that will only be resolved by the ContainerProvider.
 */
export declare class ContainerRequest {
    target: IRouterResourceTarget;
    constructor(target: IRouterResourceTarget);
}
/**
 * Request that will only be resolved by the RegisteredConstructorProvider.
 */
export declare class RegisteredConstructorRequest {
    target: IRouterResourceTarget;
    constructor(target: IRouterResourceTarget);
}
export declare class AnalyzeCallExpressionArgumentRequest {
    expression: ESTree.Expression;
    constructor(expression: ESTree.Expression);
}
export declare class AnalyzeObjectExpressionRequest {
    expression: ESTree.ObjectExpression;
    constructor(expression: ESTree.ObjectExpression);
}
export declare class AnalyzePropertyRequest {
    property: ESTree.Property;
    constructor(property: ESTree.Property);
}
export declare class AnalyzeLiteralPropertyRequest {
    key: ESTree.Identifier;
    value: ESTree.Literal | ESTree.BigIntLiteral | ESTree.RegExpLiteral;
    constructor(property: ESTree.Property);
}
export declare class AnalyzeCallExpressionPropertyRequest {
    key: ESTree.Identifier;
    value: ESTree.CallExpression;
    constructor(property: ESTree.Property);
}
export declare class AnalyzeArrayExpressionPropertyRequest {
    key: ESTree.Identifier;
    value: ESTree.ArrayExpression;
    constructor(property: ESTree.Property);
}
export declare class AnalyzeObjectExpressionPropertyRequest {
    key: ESTree.Identifier;
    value: ESTree.ObjectExpression;
    constructor(property: ESTree.Property);
}
