define(["require", "exports", "./core"], function (require, exports, core_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // tslint:disable:max-classes-per-file
    /**
     * Base RouteConfig request with the common ICreateRouteConfigInstruction property
     * needed by most RouteConfig-related builders.
     */
    class RouteConfigRequest {
        constructor(instruction) {
            this.instruction = instruction;
        }
    }
    exports.RouteConfigRequest = RouteConfigRequest;
    /**
     * Request that will only be resolved by the CompleteRouteConfigCollectionBuilder.
     */
    class CompleteRouteConfigCollectionRequest extends RouteConfigRequest {
        constructor(instruction) {
            super(instruction);
        }
    }
    exports.CompleteRouteConfigCollectionRequest = CompleteRouteConfigCollectionRequest;
    /**
     * Request that will only be resolved by the CompleteChildRouteConfigCollectionBuilder.
     */
    class CompleteChildRouteConfigCollectionRequest {
        constructor(instruction, $module) {
            this.instruction = instruction;
            this.$module = $module;
        }
    }
    exports.CompleteChildRouteConfigCollectionRequest = CompleteChildRouteConfigCollectionRequest;
    /**
     * Request that will only be resolved by thehildRouteConfigCollectionBuilder.
     */
    class ChildRouteConfigCollectionRequest {
        constructor($constructor) {
            this.$constructor = $constructor;
        }
    }
    exports.ChildRouteConfigCollectionRequest = ChildRouteConfigCollectionRequest;
    /**
     * Request that will only be resolved by the RouteConfigDefaultsBuilder.
     */
    class RouteConfigDefaultsRequest extends RouteConfigRequest {
        constructor(instruction) {
            super(instruction);
        }
    }
    exports.RouteConfigDefaultsRequest = RouteConfigDefaultsRequest;
    /**
     * Request that will only be resolved by the RouteConfigCollectionBuilder.
     */
    class RouteConfigCollectionRequest extends RouteConfigRequest {
        constructor(instruction) {
            super(instruction);
        }
    }
    exports.RouteConfigCollectionRequest = RouteConfigCollectionRequest;
    /**
     * Request that will only be resolved by the RouteConfigOverridesBuilder.
     */
    class RouteConfigOverridesRequest extends RouteConfigRequest {
        constructor(instruction) {
            super(instruction);
        }
    }
    exports.RouteConfigOverridesRequest = RouteConfigOverridesRequest;
    /**
     * Request that will only be resolved by the RouterMetadataSettingsProvider.
     */
    class RouterMetadataSettingsRequest {
        constructor(target) {
            this.target = target;
        }
    }
    exports.RouterMetadataSettingsRequest = RouterMetadataSettingsRequest;
    /**
     * Request that will only be resolved by the RouterResourceProvider.
     */
    class RouterResourceRequest {
        constructor(target) {
            this.target = target;
        }
    }
    exports.RouterResourceRequest = RouterResourceRequest;
    /**
     * Request that will only be resolved by the ContainerProvider.
     */
    class ContainerRequest {
        constructor(target) {
            this.target = target;
        }
    }
    exports.ContainerRequest = ContainerRequest;
    /**
     * Request that will only be resolved by the RegisteredConstructorProvider.
     */
    class RegisteredConstructorRequest {
        constructor(target) {
            this.target = target;
        }
    }
    exports.RegisteredConstructorRequest = RegisteredConstructorRequest;
    class AnalyzeCallExpressionArgumentRequest {
        constructor(expression) {
            this.expression = expression;
        }
    }
    exports.AnalyzeCallExpressionArgumentRequest = AnalyzeCallExpressionArgumentRequest;
    class AnalyzeObjectExpressionRequest {
        constructor(expression) {
            this.expression = expression;
        }
    }
    exports.AnalyzeObjectExpressionRequest = AnalyzeObjectExpressionRequest;
    class AnalyzePropertyRequest {
        constructor(property) {
            this.property = property;
        }
    }
    exports.AnalyzePropertyRequest = AnalyzePropertyRequest;
    class AnalyzeLiteralPropertyRequest {
        constructor(property) {
            if (!(property.key.type === "Identifier" && property.value && property.value.type === "Literal")) {
                throw new core_1.BuilderError("Wrong type passed to the request", property);
            }
            this.key = property.key;
            this.value = property.value;
        }
    }
    exports.AnalyzeLiteralPropertyRequest = AnalyzeLiteralPropertyRequest;
    class AnalyzeCallExpressionPropertyRequest {
        constructor(property) {
            if (!(property.key.type === "Identifier" && property.value && property.value.type === "CallExpression")) {
                throw new core_1.BuilderError("Wrong type passed to the request", property);
            }
            this.key = property.key;
            this.value = property.value;
        }
    }
    exports.AnalyzeCallExpressionPropertyRequest = AnalyzeCallExpressionPropertyRequest;
    class AnalyzeArrayExpressionPropertyRequest {
        constructor(property) {
            if (!(property.key.type === "Identifier" && property.value && property.value.type === "ArrayExpression")) {
                throw new core_1.BuilderError("Wrong type passed to the request", property);
            }
            this.key = property.key;
            this.value = property.value;
        }
    }
    exports.AnalyzeArrayExpressionPropertyRequest = AnalyzeArrayExpressionPropertyRequest;
    class AnalyzeObjectExpressionPropertyRequest {
        constructor(property) {
            if (!(property.key.type === "Identifier" && property.value && property.value.type === "ObjectExpression")) {
                throw new core_1.BuilderError("Wrong type passed to the request", property);
            }
            this.key = property.key;
            this.value = property.value;
        }
    }
    exports.AnalyzeObjectExpressionPropertyRequest = AnalyzeObjectExpressionPropertyRequest;
});
//# sourceMappingURL=requests.js.map