import { $Constructor } from "../model";
import { RouterResource } from "../router-resource";
import { BuilderError, NoResult } from "./core";
import { objectRouteConfigMapper } from "./mapping";
// tslint:disable:max-classes-per-file
/**
 * Returns the "configureRouter" method from a class constructor or, if it's stored in a Symbol-keyed property
 * (meaning it's wrapped by a RouterResource), will return that Symbol-keyed backup instead (since that's where
 * we need the route information from)
 */
export class ConfigureRouterMethodQuery {
    selectProperties($constructor) {
        if (!($constructor instanceof $Constructor)) {
            throw new BuilderError("Wrong type passed to query", $constructor);
        }
        const $prototype = $constructor.$export.$prototype;
        const wrappedMethod = $prototype.$properties.filter((p) => p.key === RouterResource.originalConfigureRouterSymbol);
        if (wrappedMethod.length) {
            return wrappedMethod;
        }
        const plainMethod = $prototype.$properties.filter((p) => p.key === "configureRouter");
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
export class BlockStatementCallExpressionCalleePropertyNameQuery {
    constructor(name) {
        this.name = name;
    }
    selectProperties(blockStatement) {
        if (blockStatement.type !== "BlockStatement") {
            throw new BuilderError("Wrong type passed to query", blockStatement);
        }
        const callExpressions = [];
        for (const statement of blockStatement.body) {
            if (statement.type === "ExpressionStatement" && statement.expression.type === "CallExpression") {
                const callExpression = statement.expression;
                if (callExpression.callee.type === "MemberExpression") {
                    const $callee = callExpression.callee;
                    if ($callee.property.type === "Identifier") {
                        const property = $callee.property;
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
export class CallExpressionArgumentTypeQuery {
    constructor(typeNames) {
        this.typeNames = typeNames;
    }
    selectProperties(callExpression) {
        if (callExpression.type !== "CallExpression") {
            throw new BuilderError("Wrong type passed to query", callExpression);
        }
        return callExpression.arguments.filter((arg) => this.typeNames.some((t) => arg.type === t));
    }
}
export class RouteConfigPropertyQuery {
    constructor() {
        this.propertyNames = objectRouteConfigMapper.mappings.map(m => m.targetName);
    }
    selectProperties(objectExpression) {
        if (objectExpression.type !== "ObjectExpression") {
            throw new BuilderError("Wrong type passed to query", objectExpression);
        }
        const properties = [];
        for (const prop of objectExpression.properties) {
            if (prop.type === "Property" && prop.key.type === "Identifier") {
                if (this.propertyNames.some((name) => name === prop.key.name)) {
                    properties.push(prop);
                }
            }
        }
        return properties;
    }
}
export class LiteralArgumentValueCallExpressionQuery {
    selectProperties(callExpression) {
        if (callExpression.type !== "CallExpression") {
            throw new BuilderError("Wrong type passed to query", callExpression);
        }
        const args = callExpression.arguments.filter((arg) => arg.type === "Literal");
        return args.map((arg) => arg.value);
    }
}
