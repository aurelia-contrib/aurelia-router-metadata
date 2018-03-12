import { ISpecification } from "./interfaces";
import { RouteConfigRequest } from "./requests";

export class RouteConfigRequestSpecification implements ISpecification {
  public isSatisfiedBy(input: any): boolean {
    return input instanceof RouteConfigRequest;
  }
}

export class TrueSpecification implements ISpecification {
  public isSatisfiedBy(_: any): boolean {
    return true;
  }
}
