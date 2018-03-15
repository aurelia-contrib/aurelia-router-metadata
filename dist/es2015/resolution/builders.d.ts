import { CallExpression, FunctionDeclaration } from "@src/cherow/estree";
import { IBuilder, IBuilderContext, IPropertyQuery } from "@src/resolution/interfaces";
import { AnalyzeArrayExpressionPropertyRequest, AnalyzeCallExpressionArgumentRequest, AnalyzeCallExpressionPropertyRequest, AnalyzeLiteralPropertyRequest, AnalyzeObjectExpressionPropertyRequest, AnalyzeObjectExpressionRequest, AnalyzePropertyRequest, ChildRouteConfigCollectionRequest, CompleteChildRouteConfigCollectionRequest, CompleteRouteConfigCollectionRequest, RegisteredConstructorRequest, RouteConfigCollectionRequest, RouteConfigDefaultsRequest, RouteConfigOverridesRequest, RouteConfigRequest, RouterResourceRequest } from "@src/resolution/requests";
import { RouterMetadataSettings } from "@src/router-metadata-configuration";
import { Container } from "aurelia-dependency-injection";
/**
 * Base builder that provides a simple method to get the appropriate RouterMetadataSettings
 * for a given instruction
 */
export declare abstract class RouteConfigBuilder implements IBuilder {
    abstract create(request: RouteConfigRequest, context: IBuilderContext): any;
    protected getSettings(request: RouteConfigRequest, context: IBuilderContext): RouterMetadataSettings;
}
/**
 * Builder that aggregates the results from child builders to create fully enriched RouteConfigs
 * for a given instruction, from the perspective of the target module of a route.
 */
export declare class CompleteRouteConfigCollectionBuilder extends RouteConfigBuilder {
    create(request: CompleteRouteConfigCollectionRequest, context: IBuilderContext): any;
}
/**
 * Builder that retrieves the convention- and property based RouteConfig defaults
 * for a given instruction, which are used as a seed for building the actual RouteConfigs
 */
export declare class RouteConfigDefaultsBuilder extends RouteConfigBuilder {
    create(request: RouteConfigDefaultsRequest, context: IBuilderContext): any;
}
/**
 * Builder that looks for any user-provided routes via the instruction or static properties
 * and merges them with the defaults returned from the DefaultsBuilder.
 * If no routes were specified, simply returns the defaults as a single RouteConfig.
 */
export declare class RouteConfigCollectionBuilder extends RouteConfigBuilder {
    create(request: RouteConfigCollectionRequest, context: IBuilderContext): any;
}
/**
 * Builder that retrieves the RouteConfigOverrides from the settings as well as
 * the moduleId from the instruction.
 */
export declare class RouteConfigOverridesBuilder extends RouteConfigBuilder {
    create(request: RouteConfigOverridesRequest, context: IBuilderContext): any;
}
/**
 * Builder that tries to return the most specific RouterMetadataSettings
 * for a given instruction.
 */
export declare class RouterMetadataSettingsProvider implements IBuilder {
    create(request: any, context: IBuilderContext): any;
}
/**
 * Builder that tries to return the most specific Container
 * for a given instruction.
 */
export declare class ContainerProvider implements IBuilder {
    create(request: any, context: IBuilderContext): any;
}
/**
 * Builder that resolves the RouterResource for a given target.
 */
export declare class RouterResourceProvider implements IBuilder {
    create(request: RouterResourceRequest, _: IBuilderContext): any;
}
/**
 * Builder that simply forwards a request to the most specific Container available,
 * but will only do so if that container actually has a resolver.
 * Otherwise, will return NoResult.
 */
export declare class ContainerRelay implements IBuilder {
    container: Container | null;
    constructor(container?: Container | null);
    create(request: any, context: IBuilderContext): any;
}
/**
 * Builder that aggregates the results from child builders to create fully enriched RouteConfigs
 * for a given instruction, from the perspective of the module that configures these routes.
 */
export declare class CompleteChildRouteConfigCollectionBuilder extends RouteConfigBuilder {
    create(request: CompleteChildRouteConfigCollectionRequest, context: IBuilderContext): any;
}
/**
 * Builder that looks for childRoutes in any decorator-provided information and inside the function
 * body of "configureRouter()" (if there is any).
 */
export declare class ChildRouteConfigCollectionBuilder implements IBuilder {
    create(request: ChildRouteConfigCollectionRequest, context: IBuilderContext): any;
}
/**
 * Builder that tries to retrieve the registered $Constructor instance associated to the provided
 * target.
 */
export declare class RegisteredConstructorProvider implements IBuilder {
    create(request: RegisteredConstructorRequest, context: IBuilderContext): any;
}
/**
 * Builder that forwards the results of running the provided query on the FunctionDeclaration's body
 * as individual requests, and returns the concatenated results of those requests.
 */
export declare class FunctionDeclarationAnalyzer implements IBuilder {
    query: IPropertyQuery;
    constructor(query: IPropertyQuery);
    create(request: FunctionDeclaration, context: IBuilderContext): any;
}
export declare class CallExpressionAnalyzer implements IBuilder {
    argumentQuery: IPropertyQuery;
    constructor(argumentQuery: IPropertyQuery);
    create(request: CallExpression, context: IBuilderContext): any;
}
export declare class CallExpressionArgumentAnalyzer implements IBuilder {
    create(request: AnalyzeCallExpressionArgumentRequest, context: IBuilderContext): any;
}
export declare class PropertyAnalyzeRequestRelay implements IBuilder {
    create(request: AnalyzePropertyRequest, context: IBuilderContext): any;
}
export declare class ObjectExpressionAnalyzer implements IBuilder {
    propertyQuery: IPropertyQuery;
    constructor(propertyQuery: IPropertyQuery);
    create(request: AnalyzeObjectExpressionRequest, context: IBuilderContext): any;
}
export declare class LiteralPropertyAnalyzer implements IBuilder {
    create(request: AnalyzeLiteralPropertyRequest): any;
}
export declare class CallExpressionPropertyAnalyzer implements IBuilder {
    query: IPropertyQuery;
    constructor(query: IPropertyQuery);
    create(request: AnalyzeCallExpressionPropertyRequest): any;
}
export declare class ArrayExpressionPropertyAnalyzer implements IBuilder {
    create(request: AnalyzeArrayExpressionPropertyRequest): any;
}
export declare class ObjectExpressionPropertyAnalyzer implements IBuilder {
    create(request: AnalyzeObjectExpressionPropertyRequest, context: IBuilderContext): any;
}
