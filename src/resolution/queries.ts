import {
  BlockStatement,
  CallExpression,
  Expression,
  Identifier,
  Literal,
  MemberExpression,
  ObjectExpression,
  Property,
  SpreadElement
} from "../cherow/estree";
import { $Constructor, $Property } from "../model";
import { RouterResource } from "../router-resource";
import { BuilderError, NoResult } from "./core";
import { IPropertyQuery } from "./interfaces";
import { objectRouteConfigMapper } from "./mapping";

// tslint:disable:max-classes-per-file

/**
 * Returns the "configureRouter" method from a class constructor or, if it's stored in a Symbol-keyed property
 * (meaning it's wrapped by a RouterResource), will return that Symbol-keyed backup instead (since that's where
 * we need the route information from)
 */
export class ConfigureRouterMethodQuery implements IPropertyQuery {
  public selectProperties($constructor: $Constructor): any {
    if (!($constructor instanceof $Constructor)) {
      throw new BuilderError("Wrong type passed to query", $constructor);
    }

    const $prototype = $constructor.$export.$prototype;
    const wrappedMethod = $prototype.$properties.filter(
      (p: $Property) => p.key === RouterResource.originalConfigureRouterSymbol
    );
    if (wrappedMethod.length) {
      return wrappedMethod;
    }

    const plainMethod = $prototype.$properties.filter((p: $Property) => p.key === "configureRouter");
    if (plainMethod.length) {
      return plainMethod;
    }

    return new NoResult();
  }
}

/**
 * Returns a list of CallExpressions from a BlockStatement where the name of the invoked method
 * matches the provided name.
 *
 * Example: the name "map" would return all xxx.map() expressions from a function block.
 */
export class BlockStatementCallExpressionCalleePropertyNameQuery implements IPropertyQuery {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }

  public selectProperties(blockStatement: BlockStatement): any {
    if (blockStatement.type !== "BlockStatement") {
      throw new BuilderError("Wrong type passed to query", blockStatement);
    }

    const callExpressions: CallExpression[] = [];
    for (const statement of blockStatement.body) {
      if (statement.type === "ExpressionStatement" && statement.expression.type === "CallExpression") {
        const callExpression = statement.expression as CallExpression;
        if (callExpression.callee.type === "MemberExpression") {
          const $callee = callExpression.callee as MemberExpression;
          if ($callee.property.type === "Identifier") {
            const property = $callee.property as Identifier;
            if (property.name === this.name) {
              callExpressions.push(callExpression);
            }
          }
        }
      }
    }

    return callExpressions;
  }
}

export class CallExpressionArgumentTypeQuery implements IPropertyQuery {
  public typeNames: string[];
  constructor(typeNames: string[]) {
    this.typeNames = typeNames;
  }

  public selectProperties(callExpression: CallExpression): any {
    if (callExpression.type !== "CallExpression") {
      throw new BuilderError("Wrong type passed to query", callExpression);
    }

    return callExpression.arguments.filter((arg: Expression | SpreadElement) =>
      this.typeNames.some((t: string) => arg.type === t)
    );
  }
}

export class RouteConfigPropertyQuery implements IPropertyQuery {
  public propertyNames: string[];
  constructor() {
    this.propertyNames = objectRouteConfigMapper.mappings.map(m => m.targetName);
  }

  public selectProperties(objectExpression: ObjectExpression): any[] {
    if (objectExpression.type !== "ObjectExpression") {
      throw new BuilderError("Wrong type passed to query", objectExpression);
    }

    const properties: Property[] = [];
    for (const prop of objectExpression.properties) {
      if (prop.type === "Property" && prop.key.type === "Identifier") {
        if (this.propertyNames.some((name: string) => name === (prop.key as Identifier).name)) {
          properties.push(prop);
        }
      }
    }

    return properties;
  }
}

export class LiteralArgumentValueCallExpressionQuery implements IPropertyQuery {
  public selectProperties(callExpression: CallExpression): any {
    if (callExpression.type !== "CallExpression") {
      throw new BuilderError("Wrong type passed to query", callExpression);
    }

    const args = callExpression.arguments.filter(
      (arg: Expression | SpreadElement) => arg.type === "Literal"
    ) as Literal[];

    return args.map((arg: Literal) => arg.value);
  }
}
