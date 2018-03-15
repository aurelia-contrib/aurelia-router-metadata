import { $Application, $Constructor, $Export, $Module, $Property, $Prototype } from "@src/model";
import { RouteConfigRequest } from "@src/resolution/requests";
import { RouterResource } from "@src/router-resource";
// tslint:disable:max-classes-per-file
/**
 * Specification that matches any request derived from the base RouteConfigRequest.
 */
export class RouteConfigRequestSpecification {
    isSatisfiedBy(input) {
        return input instanceof RouteConfigRequest;
    }
}
/**
 * Specification that will always yield true.
 */
export class TrueSpecification {
    isSatisfiedBy(_) {
        return true;
    }
}
/**
 * Returns the opposite result of the decorated specification.
 */
export class InverseSpecification {
    constructor(specification) {
        this.specification = specification;
    }
    isSatisfiedBy(request) {
        return !this.specification.isSatisfiedBy(request);
    }
}
/**
 * Specification that will match either a property- or symbol-keyed configureRouter method
 */
export class ConfigureRouterFunctionDeclarationSpecification {
    isSatisfiedBy(input) {
        return (input.type === "FunctionDeclaration" &&
            input.id !== null &&
            (input.id.name === "configureRouter" || input.id.name === RouterResource.originalConfigureRouterSymbol) &&
            input.body.type === "BlockStatement");
    }
}
/**
 * Specification that will match any class that is part of the module model.
 */
export class ModuleModelClassSpecification {
    isSatisfiedBy(input) {
        return (input === $Application ||
            input === $Module ||
            input === $Export ||
            input === $Constructor ||
            input === $Property ||
            input === $Prototype);
    }
}
export class CallExpressionCalleePropertyNameSpecification {
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
export class SyntaxNodeSpecification {
    isSatisfiedBy(node) {
        return /String/.test(Object.prototype.toString.call(node.type));
    }
}
