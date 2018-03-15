define(["require", "exports", "@src/model", "@src/resolution/requests", "@src/router-resource"], function (require, exports, model_1, requests_1, router_resource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // tslint:disable:max-classes-per-file
    /**
     * Specification that matches any request derived from the base RouteConfigRequest.
     */
    class RouteConfigRequestSpecification {
        isSatisfiedBy(input) {
            return input instanceof requests_1.RouteConfigRequest;
        }
    }
    exports.RouteConfigRequestSpecification = RouteConfigRequestSpecification;
    /**
     * Specification that will always yield true.
     */
    class TrueSpecification {
        isSatisfiedBy(_) {
            return true;
        }
    }
    exports.TrueSpecification = TrueSpecification;
    /**
     * Returns the opposite result of the decorated specification.
     */
    class InverseSpecification {
        constructor(specification) {
            this.specification = specification;
        }
        isSatisfiedBy(request) {
            return !this.specification.isSatisfiedBy(request);
        }
    }
    exports.InverseSpecification = InverseSpecification;
    /**
     * Specification that will match either a property- or symbol-keyed configureRouter method
     */
    class ConfigureRouterFunctionDeclarationSpecification {
        isSatisfiedBy(input) {
            return (input.type === "FunctionDeclaration" &&
                input.id !== null &&
                (input.id.name === "configureRouter" || input.id.name === router_resource_1.RouterResource.originalConfigureRouterSymbol) &&
                input.body.type === "BlockStatement");
        }
    }
    exports.ConfigureRouterFunctionDeclarationSpecification = ConfigureRouterFunctionDeclarationSpecification;
    /**
     * Specification that will match any class that is part of the module model.
     */
    class ModuleModelClassSpecification {
        isSatisfiedBy(input) {
            return (input === model_1.$Application ||
                input === model_1.$Module ||
                input === model_1.$Export ||
                input === model_1.$Constructor ||
                input === model_1.$Property ||
                input === model_1.$Prototype);
        }
    }
    exports.ModuleModelClassSpecification = ModuleModelClassSpecification;
    class CallExpressionCalleePropertyNameSpecification {
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
    }
    exports.CallExpressionCalleePropertyNameSpecification = CallExpressionCalleePropertyNameSpecification;
    class SyntaxNodeSpecification {
        isSatisfiedBy(node) {
            return /String/.test(Object.prototype.toString.call(node.type));
        }
    }
    exports.SyntaxNodeSpecification = SyntaxNodeSpecification;
});
