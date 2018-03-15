import { ArrayExpression, BigIntLiteral, CallExpression, Expression, Identifier, Literal, ObjectExpression, Property, RegExpLiteral } from "@src/cherow/estree";
import { IConfigureRouterInstruction, ICreateRouteConfigInstruction, IRouterResourceTarget } from "@src/interfaces";
import { $Constructor, $Module } from "@src/model";
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
    expression: Expression;
    constructor(expression: Expression);
}
export declare class AnalyzeObjectExpressionRequest {
    expression: ObjectExpression;
    constructor(expression: ObjectExpression);
}
export declare class AnalyzePropertyRequest {
    property: Property;
    constructor(property: Property);
}
export declare class AnalyzeLiteralPropertyRequest {
    key: Identifier;
    value: Literal | BigIntLiteral | RegExpLiteral;
    constructor(property: Property);
}
export declare class AnalyzeCallExpressionPropertyRequest {
    key: Identifier;
    value: CallExpression;
    constructor(property: Property);
}
export declare class AnalyzeArrayExpressionPropertyRequest {
    key: Identifier;
    value: ArrayExpression;
    constructor(property: Property);
}
export declare class AnalyzeObjectExpressionPropertyRequest {
    key: Identifier;
    value: ObjectExpression;
    constructor(property: Property);
}
