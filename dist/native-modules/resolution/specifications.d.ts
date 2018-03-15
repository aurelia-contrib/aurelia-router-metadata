import { CallExpression, FunctionDeclaration, Node } from "@src/cherow/estree";
import { ISpecification } from "@src/resolution/interfaces";
/**
 * Specification that matches any request derived from the base RouteConfigRequest.
 */
export declare class RouteConfigRequestSpecification implements ISpecification {
    isSatisfiedBy(input: any): boolean;
}
/**
 * Specification that will always yield true.
 */
export declare class TrueSpecification implements ISpecification {
    isSatisfiedBy(_: any): boolean;
}
/**
 * Returns the opposite result of the decorated specification.
 */
export declare class InverseSpecification implements ISpecification {
    specification: ISpecification;
    constructor(specification: ISpecification);
    isSatisfiedBy(request: any): boolean;
}
/**
 * Specification that will match either a property- or symbol-keyed configureRouter method
 */
export declare class ConfigureRouterFunctionDeclarationSpecification implements ISpecification {
    isSatisfiedBy(input: FunctionDeclaration): boolean;
}
/**
 * Specification that will match any class that is part of the module model.
 */
export declare class ModuleModelClassSpecification implements ISpecification {
    isSatisfiedBy(input: any): boolean;
}
export declare class CallExpressionCalleePropertyNameSpecification implements ISpecification {
    calleePropertyName: string;
    constructor(calleePropertyName: string);
    isSatisfiedBy(callExpression: CallExpression): boolean;
}
export declare class SyntaxNodeSpecification implements ISpecification {
    isSatisfiedBy(node: Node): boolean;
}
