
export interface IBuilder {
  create(input: any, context: IBuilderContext): any;
}

export interface IBuilderNode extends IBuilder, Array<IBuilder> {
  compose(builders: IBuilder[]): IBuilderNode;
}

export interface IBuilderContext {
  resolve(input: any): any;
}

export interface ISpecification {
  isSatisfiedBy(input: any): boolean;
}

export interface IFunction {
  execute(result: any, context: IBuilderContext): any;
}
