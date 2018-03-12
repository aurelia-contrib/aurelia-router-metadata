import { IBuilder, IBuilderContext, IBuilderNode, IFunction, ISpecification } from "./interfaces";
import { TrueSpecification } from "./specifications";

// tslint:disable:max-classes-per-file

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

export class SequentialOutputMergingBuilderNode extends Array<IBuilder> implements IBuilderNode {
  constructor(...builders: IBuilder[]) {
    super(...builders);
    Object.setPrototypeOf(this, Object.create(SequentialOutputMergingBuilderNode.prototype));
  }
  public create(request: any, context: IBuilderContext): any {
    const finalOutput = Object.create(Object.prototype);

    for (const builder of this) {
      const result = builder.create(request, context);
      if (!(result instanceof NoResult)) {
        Object.assign(finalOutput, result);
      }
    }

    return finalOutput;
  }

  public compose(builders: IBuilder[]): IBuilderNode {
    return new SequentialOutputMergingBuilderNode(...builders);
  }
}
