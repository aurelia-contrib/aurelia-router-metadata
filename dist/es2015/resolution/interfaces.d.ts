export interface IBuilder {
    create(request: any, context: IBuilderContext): any;
}
export interface IBuilderNode extends IBuilder, Array<IBuilder> {
    compose(builders: IBuilder[]): IBuilderNode;
}
export interface IBuilderContext {
    resolve(request: any): any;
}
export interface ISpecification {
    isSatisfiedBy(request: any): boolean;
}
export interface IFunction {
    execute(result: any, context: IBuilderContext): any;
}
export interface IPropertyQuery {
    selectProperties($object: any): any[];
}
