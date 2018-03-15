define(["require", "exports", "@src/model", "@src/resolution/core", "@src/resolution/mapping", "@src/router-resource"], function (require, exports, model_1, core_1, mapping_1, router_resource_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // tslint:disable:max-classes-per-file
    /**
     * Returns the "configureRouter" method from a class constructor or, if it's stored in a Symbol-keyed property
     * (meaning it's wrapped by a RouterResource), will return that Symbol-keyed backup instead (since that's where
     * we need the route information from)
     */
    class ConfigureRouterMethodQuery {
        selectProperties($constructor) {
            if (!($constructor instanceof model_1.$Constructor)) {
                throw new core_1.BuilderError("Wrong type passed to query", $constructor);
            }
            const $prototype = $constructor.$export.$prototype;
            const wrappedMethod = $prototype.$properties.filter((p) => p.key === router_resource_1.RouterResource.originalConfigureRouterSymbol);
            if (wrappedMethod.length) {
                return wrappedMethod;
            }
            const plainMethod = $prototype.$properties.filter((p) => p.key === "configureRouter");
            if (plainMethod.length) {
                return plainMethod;
            }
            return new core_1.NoResult();
        }
    }
    exports.ConfigureRouterMethodQuery = ConfigureRouterMethodQuery;
    /**
     * Returns a list of CallExpressions from a BlockStatement where the name of the invoked method
     * matches the provided name.
     *
     * Example: the name "map" would return all xxx.map() expressions from a function block.
     */
    class BlockStatementCallExpressionCalleePropertyNameQuery {
        constructor(name) {
            this.name = name;
        }
        selectProperties(blockStatement) {
            if (blockStatement.type !== "BlockStatement") {
                throw new core_1.BuilderError("Wrong type passed to query", blockStatement);
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
    exports.BlockStatementCallExpressionCalleePropertyNameQuery = BlockStatementCallExpressionCalleePropertyNameQuery;
    class CallExpressionArgumentTypeQuery {
        constructor(typeNames) {
            this.typeNames = typeNames;
        }
        selectProperties(callExpression) {
            if (callExpression.type !== "CallExpression") {
                throw new core_1.BuilderError("Wrong type passed to query", callExpression);
            }
            return callExpression.arguments.filter((arg) => this.typeNames.some((t) => arg.type === t));
        }
    }
    exports.CallExpressionArgumentTypeQuery = CallExpressionArgumentTypeQuery;
    class RouteConfigPropertyQuery {
        constructor() {
            this.propertyNames = mapping_1.objectRouteConfigMapper.mappings.map(m => m.targetName);
        }
        selectProperties(objectExpression) {
            if (objectExpression.type !== "ObjectExpression") {
                throw new core_1.BuilderError("Wrong type passed to query", objectExpression);
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
    exports.RouteConfigPropertyQuery = RouteConfigPropertyQuery;
    class LiteralArgumentValueCallExpressionQuery {
        selectProperties(callExpression) {
            if (callExpression.type !== "CallExpression") {
                throw new core_1.BuilderError("Wrong type passed to query", callExpression);
            }
            const args = callExpression.arguments.filter((arg) => arg.type === "Literal");
            return args.map((arg) => arg.value);
        }
    }
    exports.LiteralArgumentValueCallExpressionQuery = LiteralArgumentValueCallExpressionQuery;
});
