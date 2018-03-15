System.register(["./core"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var core_1, RouteConfigRequest, CompleteRouteConfigCollectionRequest, CompleteChildRouteConfigCollectionRequest, ChildRouteConfigCollectionRequest, RouteConfigDefaultsRequest, RouteConfigCollectionRequest, RouteConfigOverridesRequest, RouterMetadataSettingsRequest, RouterResourceRequest, ContainerRequest, RegisteredConstructorRequest, AnalyzeCallExpressionArgumentRequest, AnalyzeObjectExpressionRequest, AnalyzePropertyRequest, AnalyzeLiteralPropertyRequest, AnalyzeCallExpressionPropertyRequest, AnalyzeArrayExpressionPropertyRequest, AnalyzeObjectExpressionPropertyRequest;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            }
        ],
        execute: function () {
            // tslint:disable:max-classes-per-file
            /**
             * Base RouteConfig request with the common ICreateRouteConfigInstruction property
             * needed by most RouteConfig-related builders.
             */
            RouteConfigRequest = class RouteConfigRequest {
                constructor(instruction) {
                    this.instruction = instruction;
                }
            };
            exports_1("RouteConfigRequest", RouteConfigRequest);
            /**
             * Request that will only be resolved by the CompleteRouteConfigCollectionBuilder.
             */
            CompleteRouteConfigCollectionRequest = class CompleteRouteConfigCollectionRequest extends RouteConfigRequest {
                constructor(instruction) {
                    super(instruction);
                }
            };
            exports_1("CompleteRouteConfigCollectionRequest", CompleteRouteConfigCollectionRequest);
            /**
             * Request that will only be resolved by the CompleteChildRouteConfigCollectionBuilder.
             */
            CompleteChildRouteConfigCollectionRequest = class CompleteChildRouteConfigCollectionRequest {
                constructor(instruction, $module) {
                    this.instruction = instruction;
                    this.$module = $module;
                }
            };
            exports_1("CompleteChildRouteConfigCollectionRequest", CompleteChildRouteConfigCollectionRequest);
            /**
             * Request that will only be resolved by thehildRouteConfigCollectionBuilder.
             */
            ChildRouteConfigCollectionRequest = class ChildRouteConfigCollectionRequest {
                constructor($constructor) {
                    this.$constructor = $constructor;
                }
            };
            exports_1("ChildRouteConfigCollectionRequest", ChildRouteConfigCollectionRequest);
            /**
             * Request that will only be resolved by the RouteConfigDefaultsBuilder.
             */
            RouteConfigDefaultsRequest = class RouteConfigDefaultsRequest extends RouteConfigRequest {
                constructor(instruction) {
                    super(instruction);
                }
            };
            exports_1("RouteConfigDefaultsRequest", RouteConfigDefaultsRequest);
            /**
             * Request that will only be resolved by the RouteConfigCollectionBuilder.
             */
            RouteConfigCollectionRequest = class RouteConfigCollectionRequest extends RouteConfigRequest {
                constructor(instruction) {
                    super(instruction);
                }
            };
            exports_1("RouteConfigCollectionRequest", RouteConfigCollectionRequest);
            /**
             * Request that will only be resolved by the RouteConfigOverridesBuilder.
             */
            RouteConfigOverridesRequest = class RouteConfigOverridesRequest extends RouteConfigRequest {
                constructor(instruction) {
                    super(instruction);
                }
            };
            exports_1("RouteConfigOverridesRequest", RouteConfigOverridesRequest);
            /**
             * Request that will only be resolved by the RouterMetadataSettingsProvider.
             */
            RouterMetadataSettingsRequest = class RouterMetadataSettingsRequest {
                constructor(target) {
                    this.target = target;
                }
            };
            exports_1("RouterMetadataSettingsRequest", RouterMetadataSettingsRequest);
            /**
             * Request that will only be resolved by the RouterResourceProvider.
             */
            RouterResourceRequest = class RouterResourceRequest {
                constructor(target) {
                    this.target = target;
                }
            };
            exports_1("RouterResourceRequest", RouterResourceRequest);
            /**
             * Request that will only be resolved by the ContainerProvider.
             */
            ContainerRequest = class ContainerRequest {
                constructor(target) {
                    this.target = target;
                }
            };
            exports_1("ContainerRequest", ContainerRequest);
            /**
             * Request that will only be resolved by the RegisteredConstructorProvider.
             */
            RegisteredConstructorRequest = class RegisteredConstructorRequest {
                constructor(target) {
                    this.target = target;
                }
            };
            exports_1("RegisteredConstructorRequest", RegisteredConstructorRequest);
            AnalyzeCallExpressionArgumentRequest = class AnalyzeCallExpressionArgumentRequest {
                constructor(expression) {
                    this.expression = expression;
                }
            };
            exports_1("AnalyzeCallExpressionArgumentRequest", AnalyzeCallExpressionArgumentRequest);
            AnalyzeObjectExpressionRequest = class AnalyzeObjectExpressionRequest {
                constructor(expression) {
                    this.expression = expression;
                }
            };
            exports_1("AnalyzeObjectExpressionRequest", AnalyzeObjectExpressionRequest);
            AnalyzePropertyRequest = class AnalyzePropertyRequest {
                constructor(property) {
                    this.property = property;
                }
            };
            exports_1("AnalyzePropertyRequest", AnalyzePropertyRequest);
            AnalyzeLiteralPropertyRequest = class AnalyzeLiteralPropertyRequest {
                constructor(property) {
                    if (!(property.key.type === "Identifier" && property.value && property.value.type === "Literal")) {
                        throw new core_1.BuilderError("Wrong type passed to the request", property);
                    }
                    this.key = property.key;
                    this.value = property.value;
                }
            };
            exports_1("AnalyzeLiteralPropertyRequest", AnalyzeLiteralPropertyRequest);
            AnalyzeCallExpressionPropertyRequest = class AnalyzeCallExpressionPropertyRequest {
                constructor(property) {
                    if (!(property.key.type === "Identifier" && property.value && property.value.type === "CallExpression")) {
                        throw new core_1.BuilderError("Wrong type passed to the request", property);
                    }
                    this.key = property.key;
                    this.value = property.value;
                }
            };
            exports_1("AnalyzeCallExpressionPropertyRequest", AnalyzeCallExpressionPropertyRequest);
            AnalyzeArrayExpressionPropertyRequest = class AnalyzeArrayExpressionPropertyRequest {
                constructor(property) {
                    if (!(property.key.type === "Identifier" && property.value && property.value.type === "ArrayExpression")) {
                        throw new core_1.BuilderError("Wrong type passed to the request", property);
                    }
                    this.key = property.key;
                    this.value = property.value;
                }
            };
            exports_1("AnalyzeArrayExpressionPropertyRequest", AnalyzeArrayExpressionPropertyRequest);
            AnalyzeObjectExpressionPropertyRequest = class AnalyzeObjectExpressionPropertyRequest {
                constructor(property) {
                    if (!(property.key.type === "Identifier" && property.value && property.value.type === "ObjectExpression")) {
                        throw new core_1.BuilderError("Wrong type passed to the request", property);
                    }
                    this.key = property.key;
                    this.value = property.value;
                }
            };
            exports_1("AnalyzeObjectExpressionPropertyRequest", AnalyzeObjectExpressionPropertyRequest);
        }
    };
});
