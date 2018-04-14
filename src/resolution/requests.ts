import { ESTree } from "cherow";
import { IConfigureRouterInstruction, ICreateRouteConfigInstruction, IRouterResourceTarget } from "../interfaces";
import { $Constructor, $Module } from "../model";
import { BuilderError } from "./core";

// tslint:disable:max-classes-per-file

/**
 * Base RouteConfig request with the common ICreateRouteConfigInstruction property
 * needed by most RouteConfig-related builders.
 */
export abstract class RouteConfigRequest {
  public instruction: ICreateRouteConfigInstruction;

  constructor(instruction: ICreateRouteConfigInstruction) {
    this.instruction = instruction;
  }
}

/**
 * Request that will only be resolved by the CompleteRouteConfigCollectionBuilder.
 */
export class CompleteRouteConfigCollectionRequest extends RouteConfigRequest {
  constructor(instruction: ICreateRouteConfigInstruction) {
    super(instruction);
  }
}

/**
 * Request that will only be resolved by the CompleteChildRouteConfigCollectionBuilder.
 */
export class CompleteChildRouteConfigCollectionRequest {
  public instruction: IConfigureRouterInstruction;
  public $module?: $Module;

  constructor(instruction: IConfigureRouterInstruction, $module?: $Module) {
    this.instruction = instruction;
    this.$module = $module;
  }
}

/**
 * Request that will only be resolved by thehildRouteConfigCollectionBuilder.
 */
export class ChildRouteConfigCollectionRequest {
  public $constructor: $Constructor;

  constructor($constructor: $Constructor) {
    this.$constructor = $constructor;
  }
}

/**
 * Request that will only be resolved by the RouteConfigDefaultsBuilder.
 */
export class RouteConfigDefaultsRequest extends RouteConfigRequest {
  constructor(instruction: ICreateRouteConfigInstruction) {
    super(instruction);
  }
}

/**
 * Request that will only be resolved by the RouteConfigCollectionBuilder.
 */
export class RouteConfigCollectionRequest extends RouteConfigRequest {
  constructor(instruction: ICreateRouteConfigInstruction) {
    super(instruction);
  }
}

/**
 * Request that will only be resolved by the RouteConfigOverridesBuilder.
 */
export class RouteConfigOverridesRequest extends RouteConfigRequest {
  constructor(instruction: ICreateRouteConfigInstruction) {
    super(instruction);
  }
}

/**
 * Request that will only be resolved by the RouterMetadataSettingsProvider.
 */
export class RouterMetadataSettingsRequest {
  public target: IRouterResourceTarget;

  constructor(target: IRouterResourceTarget) {
    this.target = target;
  }
}

/**
 * Request that will only be resolved by the RouterResourceProvider.
 */
export class RouterResourceRequest {
  public target: IRouterResourceTarget;

  constructor(target: IRouterResourceTarget) {
    this.target = target;
  }
}

/**
 * Request that will only be resolved by the ContainerProvider.
 */
export class ContainerRequest {
  public target: IRouterResourceTarget;

  constructor(target: IRouterResourceTarget) {
    this.target = target;
  }
}

/**
 * Request that will only be resolved by the RegisteredConstructorProvider.
 */
export class RegisteredConstructorRequest {
  public target: IRouterResourceTarget;

  constructor(target: IRouterResourceTarget) {
    this.target = target;
  }
}

export class AnalyzeCallExpressionArgumentRequest {
  public expression: ESTree.Expression;
  constructor(expression: ESTree.Expression) {
    this.expression = expression;
  }
}

export class AnalyzeObjectExpressionRequest {
  public expression: ESTree.ObjectExpression;
  constructor(expression: ESTree.ObjectExpression) {
    this.expression = expression;
  }
}

export class AnalyzePropertyRequest {
  public property: ESTree.Property;
  constructor(property: ESTree.Property) {
    this.property = property;
  }
}

export class AnalyzeLiteralPropertyRequest {
  public key: ESTree.Identifier;
  public value: ESTree.Literal | ESTree.BigIntLiteral | ESTree.RegExpLiteral;
  constructor(property: ESTree.Property) {
    if (!(property.key.type === "Identifier" && property.value && property.value.type === "Literal")) {
      throw new BuilderError("Wrong type passed to the request", property);
    }
    this.key = property.key;
    this.value = property.value;
  }
}

export class AnalyzeCallExpressionPropertyRequest {
  public key: ESTree.Identifier;
  public value: ESTree.CallExpression;
  constructor(property: ESTree.Property) {
    if (!(property.key.type === "Identifier" && property.value && property.value.type === "CallExpression")) {
      throw new BuilderError("Wrong type passed to the request", property);
    }
    this.key = property.key;
    this.value = property.value;
  }
}

export class AnalyzeArrayExpressionPropertyRequest {
  public key: ESTree.Identifier;
  public value: ESTree.ArrayExpression;
  constructor(property: ESTree.Property) {
    if (!(property.key.type === "Identifier" && property.value && property.value.type === "ArrayExpression")) {
      throw new BuilderError("Wrong type passed to the request", property);
    }
    this.key = property.key;
    this.value = property.value;
  }
}

export class AnalyzeObjectExpressionPropertyRequest {
  public key: ESTree.Identifier;
  public value: ESTree.ObjectExpression;
  constructor(property: ESTree.Property) {
    if (!(property.key.type === "Identifier" && property.value && property.value.type === "ObjectExpression")) {
      throw new BuilderError("Wrong type passed to the request", property);
    }
    this.key = property.key;
    this.value = property.value;
  }
}
