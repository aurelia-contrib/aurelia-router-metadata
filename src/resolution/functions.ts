import { IBuilderContext, IFunction } from "./interfaces";

export class PromisifyFunction implements IFunction {
  public execute(result: any, _: IBuilderContext): any {
    return Promise.resolve(result);
  }
}

export class EnsureObjectPropertyFunction implements IFunction {
  public propertyName: string;

  constructor(propertyName: string) {
    this.propertyName = propertyName;
  }

  public execute(result: any, _: IBuilderContext): any {
    result[this.propertyName] = { ...result[this.propertyName] };

    return result;
  }
}
