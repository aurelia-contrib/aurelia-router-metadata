import { IBuilder, IBuilderContext, IBuilderNode, IFunction, ISpecification } from "@src/resolution/interfaces";
import { TrueSpecification } from "@src/resolution/specifications";
import { Logger } from "aurelia-logging";

// tslint:disable:max-classes-per-file

/**
 * The BuilderContext is a resolution scope for a specific graph of builders.
 * Does not have to be the root, and can be nested multiple times in a graph to achieve multiple sub-scopes.
 */
export class BuilderContext implements IBuilderContext {
  public builder: IBuilder;

  constructor(builder: IBuilder) {
    this.builder = builder;
  }

  public resolve(input: any): any {
    return this.builder.create(input, this);
  }
}

// tslint:disable-next-line:no-unnecessary-class
export class NoResult {}

/**
 * Decorates an IBuilderNode and filters requests so that only certain requests are
 * passed through to the decorated builder.
 */
export class FilteringBuilderNode extends Array<IBuilder> implements IBuilderNode {
  private _builder: IBuilder;
  public get builder(): IBuilder {
    return this._builder;
  }
  private _specification: ISpecification;
  public get specification(): ISpecification {
    return this._specification;
  }
  constructor(builder: IBuilder, specification: ISpecification) {
    super(builder);
    this._builder = builder;
    this._specification = specification;
    Object.setPrototypeOf(this, Object.create(FilteringBuilderNode.prototype));
  }

  public create(request: any, context: IBuilderContext): any {
    if (!this.specification.isSatisfiedBy(request)) {
      return new NoResult();
    }

    return this.builder.create(request, context);
  }

  public compose(builders: IBuilder[]): IBuilderNode {
    const compositeNode = new CompositeBuilderNode(...builders);

    return new FilteringBuilderNode(compositeNode, this.specification);
  }
}

/**
 * Decorates a list of IBuilderNodes and returns the first result that is not a NoResult
 */
export class CompositeBuilderNode extends Array<IBuilder> implements IBuilderNode {
  constructor(...builders: IBuilder[]) {
    super(...builders);
    Object.setPrototypeOf(this, Object.create(CompositeBuilderNode.prototype));
  }
  public create(request: any, context: IBuilderContext): any {
    for (const builder of this) {
      const result = builder.create(request, context);
      if (!(result instanceof NoResult)) {
        return result;
      }
    }

    return new NoResult();
  }

  public compose(builders: IBuilder[]): IBuilderNode {
    return new CompositeBuilderNode(...builders);
  }
}

/**
 * Decorates an IBuilder and filters requests so that only certain requests are passed through to
 * the decorated builder. Then invokes the provided IFunction on the result returned from that builder.
 */
export class Postprocessor extends Array<IBuilder> implements IBuilderNode {
  public builder: IBuilder;
  public func: IFunction;
  public specification: ISpecification;

  constructor(builder: IBuilder, func: IFunction, specification: ISpecification = new TrueSpecification()) {
    super(builder);
    this.builder = builder;
    this.func = func;
    this.specification = specification;
    Object.setPrototypeOf(this, Object.create(Postprocessor.prototype));
  }

  public create(request: any, context: IBuilderContext): any {
    const result = this.builder.create(request, context);
    if (result instanceof NoResult) {
      return result;
    }

    if (!this.specification.isSatisfiedBy(result)) {
      return result;
    }

    return this.func.execute(result, context);
  }

  public compose(builders: IBuilder[]): IBuilderNode {
    return new CompositeBuilderNode(...builders);
  }
}

/**
 * Guards against NoResult outputs by always throwing a BuilderError.
 * This is meant to be the last builder in a chain.
 */
export class TerminatingBuilder implements IBuilder {
  public create(request: any, _context: IBuilderContext): any {
    throw new BuilderError("Unable to resolve a request. See the error object for details on the request.", request);
  }
}

export class LoggingBuilder implements IBuilder {
  public builder: IBuilder;

  protected logger: Logger;
  protected depth: number = 0;

  constructor(builder: IBuilder, logger: Logger) {
    this.builder = builder;
    this.logger = logger;
  }

  public create(request: any, context: IBuilderContext): any {
    this.onResultRequested(new RequestTrace(request, ++this.depth));

    let created: boolean = false;
    let result: any = null;
    try {
      result = this.builder.create(request, context);
      created = true;

      return result;
    } finally {
      if (created) {
        this.onResultCreated(new ResultTrace(request, result, this.depth));
      }
      this.depth--;
    }
  }

  protected onResultRequested(trace: RequestTrace): void {
    this.logger.debug(`${"  ".repeat(trace.depth)}Requested:`, trace.request);
  }

  protected onResultCreated(trace: ResultTrace): void {
    this.logger.debug(`${"  ".repeat(trace.depth)}Created:`, trace.result);
  }
}

export class RequestTrace {
  public request: any;
  public depth: number;

  constructor(request: any, depth: number) {
    this.depth = depth;
    this.request = request;
  }
}

export class ResultTrace extends RequestTrace {
  public result: any;

  constructor(request: any, result: any, depth: number) {
    super(depth, request);
    this.result = result;
  }
}

export class BuilderError extends Error {
  public request: any;
  constructor(message: string, request: any) {
    super(message);
    this.request = request;
  }
}
