System.register(["@src/model", "@src/resolution/requests", "@src/router-resource"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var model_1, requests_1, router_resource_1, RouteConfigRequestSpecification, TrueSpecification, InverseSpecification, ConfigureRouterFunctionDeclarationSpecification, ModuleModelClassSpecification, CallExpressionCalleePropertyNameSpecification, SyntaxNodeSpecification;
    return {
        setters: [
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (requests_1_1) {
                requests_1 = requests_1_1;
            },
            function (router_resource_1_1) {
                router_resource_1 = router_resource_1_1;
            }
        ],
        execute: function () {
            // tslint:disable:max-classes-per-file
            /**
             * Specification that matches any request derived from the base RouteConfigRequest.
             */
            RouteConfigRequestSpecification = class RouteConfigRequestSpecification {
                isSatisfiedBy(input) {
                    return input instanceof requests_1.RouteConfigRequest;
                }
            };
            exports_1("RouteConfigRequestSpecification", RouteConfigRequestSpecification);
            /**
             * Specification that will always yield true.
             */
            TrueSpecification = class TrueSpecification {
                isSatisfiedBy(_) {
                    return true;
                }
            };
            exports_1("TrueSpecification", TrueSpecification);
            /**
             * Returns the opposite result of the decorated specification.
             */
            InverseSpecification = class InverseSpecification {
                constructor(specification) {
                    this.specification = specification;
                }
                isSatisfiedBy(request) {
                    return !this.specification.isSatisfiedBy(request);
                }
            };
            exports_1("InverseSpecification", InverseSpecification);
            /**
             * Specification that will match either a property- or symbol-keyed configureRouter method
             */
            ConfigureRouterFunctionDeclarationSpecification = class ConfigureRouterFunctionDeclarationSpecification {
                isSatisfiedBy(input) {
                    return (input.type === "FunctionDeclaration" &&
                        input.id !== null &&
                        (input.id.name === "configureRouter" || input.id.name === router_resource_1.RouterResource.originalConfigureRouterSymbol) &&
                        input.body.type === "BlockStatement");
                }
            };
            exports_1("ConfigureRouterFunctionDeclarationSpecification", ConfigureRouterFunctionDeclarationSpecification);
            /**
             * Specification that will match any class that is part of the module model.
             */
            ModuleModelClassSpecification = class ModuleModelClassSpecification {
                isSatisfiedBy(input) {
                    return (input === model_1.$Application ||
                        input === model_1.$Module ||
                        input === model_1.$Export ||
                        input === model_1.$Constructor ||
                        input === model_1.$Property ||
                        input === model_1.$Prototype);
                }
            };
            exports_1("ModuleModelClassSpecification", ModuleModelClassSpecification);
            CallExpressionCalleePropertyNameSpecification = class CallExpressionCalleePropertyNameSpecification {
                constructor(calleePropertyName) {
                    this.calleePropertyName = calleePropertyName;
                }
                isSatisfiedBy(callExpression) {
                    let expr = callExpression;
                    if (callExpression.type !== "CallExpression") {
                        if (callExpression.value && callExpression.value.type === "CallExpression") {
                            expr = callExpression.value;
                        }
                        else {
                            return false;
                        }
                    }
                    if (expr.callee.type === "MemberExpression") {
                        const $callee = expr.callee;
                        if ($callee.property.type === "Identifier") {
                            const property = $callee.property;
                            if (property.name === this.calleePropertyName) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
            };
            exports_1("CallExpressionCalleePropertyNameSpecification", CallExpressionCalleePropertyNameSpecification);
            SyntaxNodeSpecification = class SyntaxNodeSpecification {
                isSatisfiedBy(node) {
                    return /String/.test(Object.prototype.toString.call(node.type));
                }
            };
            exports_1("SyntaxNodeSpecification", SyntaxNodeSpecification);
        }
    };
});
