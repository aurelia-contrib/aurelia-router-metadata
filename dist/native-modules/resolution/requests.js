import { BuilderError } from "./core";
// tslint:disable:max-classes-per-file
/**
 * Base RouteConfig request with the common ICreateRouteConfigInstruction property
 * needed by most RouteConfig-related builders.
 */
export class RouteConfigRequest {
    constructor(instruction) {
        this.instruction = instruction;
    }
}
/**
 * Request that will only be resolved by the CompleteRouteConfigCollectionBuilder.
 */
export class CompleteRouteConfigCollectionRequest extends RouteConfigRequest {
    constructor(instruction) {
        super(instruction);
    }
}
/**
 * Request that will only be resolved by the CompleteChildRouteConfigCollectionBuilder.
 */
export class CompleteChildRouteConfigCollectionRequest {
    constructor(instruction, $module) {
        this.instruction = instruction;
        this.$module = $module;
    }
}
/**
 * Request that will only be resolved by thehildRouteConfigCollectionBuilder.
 */
export class ChildRouteConfigCollectionRequest {
    constructor($constructor) {
        this.$constructor = $constructor;
    }
}
/**
 * Request that will only be resolved by the RouteConfigDefaultsBuilder.
 */
export class RouteConfigDefaultsRequest extends RouteConfigRequest {
    constructor(instruction) {
        super(instruction);
    }
}
/**
 * Request that will only be resolved by the RouteConfigCollectionBuilder.
 */
export class RouteConfigCollectionRequest extends RouteConfigRequest {
    constructor(instruction) {
        super(instruction);
    }
}
/**
 * Request that will only be resolved by the RouteConfigOverridesBuilder.
 */
export class RouteConfigOverridesRequest extends RouteConfigRequest {
    constructor(instruction) {
        super(instruction);
    }
}
/**
 * Request that will only be resolved by the RouterMetadataSettingsProvider.
 */
export class RouterMetadataSettingsRequest {
    constructor(target) {
        this.target = target;
    }
}
/**
 * Request that will only be resolved by the RouterResourceProvider.
 */
export class RouterResourceRequest {
    constructor(target) {
        this.target = target;
    }
}
/**
 * Request that will only be resolved by the ContainerProvider.
 */
export class ContainerRequest {
    constructor(target) {
        this.target = target;
    }
}
/**
 * Request that will only be resolved by the RegisteredConstructorProvider.
 */
export class RegisteredConstructorRequest {
    constructor(target) {
        this.target = target;
    }
}
export class AnalyzeCallExpressionArgumentRequest {
    constructor(expression) {
        this.expression = expression;
    }
}
export class AnalyzeObjectExpressionRequest {
    constructor(expression) {
        this.expression = expression;
    }
}
export class AnalyzePropertyRequest {
    constructor(property) {
        this.property = property;
    }
}
export class AnalyzeLiteralPropertyRequest {
    constructor(property) {
        if (!(property.key.type === "Identifier" && property.value && property.value.type === "Literal")) {
            throw new BuilderError("Wrong type passed to the request", property);
        }
        this.key = property.key;
        this.value = property.value;
    }
}
export class AnalyzeCallExpressionPropertyRequest {
    constructor(property) {
        if (!(property.key.type === "Identifier" && property.value && property.value.type === "CallExpression")) {
            throw new BuilderError("Wrong type passed to the request", property);
        }
        this.key = property.key;
        this.value = property.value;
    }
}
export class AnalyzeArrayExpressionPropertyRequest {
    constructor(property) {
        if (!(property.key.type === "Identifier" && property.value && property.value.type === "ArrayExpression")) {
            throw new BuilderError("Wrong type passed to the request", property);
        }
        this.key = property.key;
        this.value = property.value;
    }
}
export class AnalyzeObjectExpressionPropertyRequest {
    constructor(property) {
        if (!(property.key.type === "Identifier" && property.value && property.value.type === "ObjectExpression")) {
            throw new BuilderError("Wrong type passed to the request", property);
        }
        this.key = property.key;
        this.value = property.value;
    }
}
