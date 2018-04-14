import { ESTree } from "cherow";
import { $Application, $Constructor, $Export, $Module, $Property, $Prototype } from "../model";
import { RouterResource } from "../router-resource";
import { ISpecification } from "./interfaces";
import { RouteConfigRequest } from "./requests";

// tslint:disable:max-classes-per-file

/**
 * Specification that matches any request derived from the base RouteConfigRequest.
 */
export class RouteConfigRequestSpecification implements ISpecification {
  public isSatisfiedBy(input: any): boolean {
    return input instanceof RouteConfigRequest;
  }
}

/**
 * Specification that will always yield true.
 */
export class TrueSpecification implements ISpecification {
  public isSatisfiedBy(_: any): boolean {
    return true;
  }
}

/**
 * Returns the opposite result of the decorated specification.
 */
export class InverseSpecification implements ISpecification {
  public specification: ISpecification;
  constructor(specification: ISpecification) {
    this.specification = specification;
  }

  public isSatisfiedBy(request: any): boolean {
    return !this.specification.isSatisfiedBy(request);
  }
}

/**
 * Specification that will match either a property- or symbol-keyed configureRouter method
 */
export class ConfigureRouterFunctionDeclarationSpecification implements ISpecification {
  public isSatisfiedBy(input: ESTree.FunctionDeclaration): boolean {
    return (
      input.type === "FunctionDeclaration" &&
      input.id !== null &&
      (input.id.name === "configureRouter" || input.id.name === RouterResource.originalConfigureRouterSymbol) &&
      input.body.type === "BlockStatement"
    );
  }
}

/**
 * Specification that will match any class that is part of the module model.
 */
export class ModuleModelClassSpecification implements ISpecification {
  public isSatisfiedBy(input: any): boolean {
    return (
      input === $Application ||
      input === $Module ||
      input === $Export ||
      input === $Constructor ||
      input === $Property ||
      input === $Prototype
    );
  }
}

export class CallExpressionCalleePropertyNameSpecification implements ISpecification {
  public calleePropertyName: string;
  constructor(calleePropertyName: string) {
    this.calleePropertyName = calleePropertyName;
  }

  public isSatisfiedBy(callExpression: ESTree.CallExpression): boolean {
    let expr: ESTree.CallExpression = callExpression;
    if (callExpression.type !== "CallExpression") {
      if ((callExpression as any).value && (callExpression as any).value.type === "CallExpression") {
        expr = (callExpression as any).value;
      } else {
        return false;
      }
    }

    if (expr.callee.type === "MemberExpression") {
      const $callee = expr.callee as ESTree.MemberExpression;
      if ($callee.property.type === "Identifier") {
        const property = $callee.property as ESTree.Identifier;
        if (property.name === this.calleePropertyName) {
          return true;
        }
      }
    }

    return false;
  }
}

export class SyntaxNodeSpecification implements ISpecification {
  public isSatisfiedBy(node: ESTree.Node): boolean {
    return /String/.test(Object.prototype.toString.call(node.type));
  }
}
