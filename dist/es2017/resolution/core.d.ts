import { IBuilder, IBuilderContext, IBuilderNode, IFunction, ISpecification } from "@src/resolution/interfaces";
import { Logger } from "aurelia-logging";
/**
 * The BuilderContext is a resolution scope for a specific graph of builders.
 * Does not have to be the root, and can be nested multiple times in a graph to achieve multiple sub-scopes.
 */
export declare class BuilderContext implements IBuilderContext {
    builder: IBuilder;
    constructor(builder: IBuilder);
    resolve(input: any): any;
}
export declare class NoResult {
}
/**
 * Decorates an IBuilderNode and filters requests so that only certain requests are
 * passed through to the decorated builder.
 */
export declare class FilteringBuilderNode extends Array<IBuilder> implements IBuilderNode {
    private _builder;
    readonly builder: IBuilder;
    private _specification;
    readonly specification: ISpecification;
    constructor(builder: IBuilder, specification: ISpecification);
    create(request: any, context: IBuilderContext): any;
    compose(builders: IBuilder[]): IBuilderNode;
}
/**
 * Decorates a list of IBuilderNodes and returns the first result that is not a NoResult
 */
export declare class CompositeBuilderNode extends Array<IBuilder> implements IBuilderNode {
    constructor(...builders: IBuilder[]);
    create(request: any, context: IBuilderContext): any;
    compose(builders: IBuilder[]): IBuilderNode;
}
/**
 * Decorates an IBuilder and filters requests so that only certain requests are passed through to
 * the decorated builder. Then invokes the provided IFunction on the result returned from that builder.
 */
export declare class Postprocessor extends Array<IBuilder> implements IBuilderNode {
    builder: IBuilder;
    func: IFunction;
    specification: ISpecification;
    constructor(builder: IBuilder, func: IFunction, specification?: ISpecification);
    create(request: any, context: IBuilderContext): any;
    compose(builders: IBuilder[]): IBuilderNode;
}
/**
 * Guards against NoResult outputs by always throwing a BuilderError.
 * This is meant to be the last builder in a chain.
 */
export declare class TerminatingBuilder implements IBuilder {
    create(request: any, _context: IBuilderContext): any;
}
export declare class LoggingBuilder implements IBuilder {
    builder: IBuilder;
    protected logger: Logger;
    protected depth: number;
    constructor(builder: IBuilder, logger: Logger);
    create(request: any, context: IBuilderContext): any;
    protected onResultRequested(trace: RequestTrace): void;
    protected onResultCreated(trace: ResultTrace): void;
}
export declare class RequestTrace {
    request: any;
    depth: number;
    constructor(request: any, depth: number);
}
export declare class ResultTrace extends RequestTrace {
    result: any;
    constructor(request: any, result: any, depth: number);
}
export declare class BuilderError extends Error {
    request: any;
    constructor(message: string, request: any);
}
