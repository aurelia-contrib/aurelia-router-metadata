import {
  ArrayExpression,
  BigIntLiteral,
  CallExpression,
  Expression,
  Identifier,
  Literal,
  ObjectExpression,
  Property,
  RegExpLiteral
} from "../cherow/estree";
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
  public expression: Expression;
  constructor(expression: Expression) {
    this.expression = expression;
  }
}

export class AnalyzeObjectExpressionRequest {
  public expression: ObjectExpression;
  constructor(expression: ObjectExpression) {
    this.expression = expression;
  }
}

export class AnalyzePropertyRequest {
  public property: Property;
  constructor(property: Property) {
    this.property = property;
  }
}

export class AnalyzeLiteralPropertyRequest {
  public key: Identifier;
  public value: Literal | BigIntLiteral | RegExpLiteral;
  constructor(property: Property) {
    if (!(property.key.type === "Identifier" && property.value && property.value.type === "Literal")) {
      throw new BuilderError("Wrong type passed to the request", property);
    }
    this.key = property.key;
    this.value = property.value;
  }
}

export class AnalyzeCallExpressionPropertyRequest {
  public key: Identifier;
  public value: CallExpression;
  constructor(property: Property) {
    if (!(property.key.type === "Identifier" && property.value && property.value.type === "CallExpression")) {
      throw new BuilderError("Wrong type passed to the request", property);
    }
    this.key = property.key;
    this.value = property.value;
  }
}

export class AnalyzeArrayExpressionPropertyRequest {
  public key: Identifier;
  public value: ArrayExpression;
  constructor(property: Property) {
    if (!(property.key.type === "Identifier" && property.value && property.value.type === "ArrayExpression")) {
      throw new BuilderError("Wrong type passed to the request", property);
    }
    this.key = property.key;
    this.value = property.value;
  }
}

export class AnalyzeObjectExpressionPropertyRequest {
  public key: Identifier;
  public value: ObjectExpression;
  constructor(property: Property) {
    if (!(property.key.type === "Identifier" && property.value && property.value.type === "ObjectExpression")) {
      throw new BuilderError("Wrong type passed to the request", property);
    }
    this.key = property.key;
    this.value = property.value;
  }
}
