System.register(["@src/model", "@src/resolution/core", "@src/resolution/mapping", "@src/router-resource"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var model_1, core_1, mapping_1, router_resource_1, ConfigureRouterMethodQuery, BlockStatementCallExpressionCalleePropertyNameQuery, CallExpressionArgumentTypeQuery, RouteConfigPropertyQuery, LiteralArgumentValueCallExpressionQuery;
    return {
        setters: [
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (mapping_1_1) {
                mapping_1 = mapping_1_1;
            },
            function (router_resource_1_1) {
                router_resource_1 = router_resource_1_1;
            }
        ],
        execute: function () {
            // tslint:disable:max-classes-per-file
            /**
             * Returns the "configureRouter" method from a class constructor or, if it's stored in a Symbol-keyed property
             * (meaning it's wrapped by a RouterResource), will return that Symbol-keyed backup instead (since that's where
             * we need the route information from)
             */
            ConfigureRouterMethodQuery = class ConfigureRouterMethodQuery {
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
            };
            exports_1("ConfigureRouterMethodQuery", ConfigureRouterMethodQuery);
            /**
             * Returns a list of CallExpressions from a BlockStatement where the name of the invoked method
             * matches the provided name.
             *
             * Example: the name "map" would return all xxx.map() expressions from a function block.
             */
            BlockStatementCallExpressionCalleePropertyNameQuery = class BlockStatementCallExpressionCalleePropertyNameQuery {
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
            };
            exports_1("BlockStatementCallExpressionCalleePropertyNameQuery", BlockStatementCallExpressionCalleePropertyNameQuery);
            CallExpressionArgumentTypeQuery = class CallExpressionArgumentTypeQuery {
                constructor(typeNames) {
                    this.typeNames = typeNames;
                }
                selectProperties(callExpression) {
                    if (callExpression.type !== "CallExpression") {
                        throw new core_1.BuilderError("Wrong type passed to query", callExpression);
                    }
                    return callExpression.arguments.filter((arg) => this.typeNames.some((t) => arg.type === t));
                }
            };
            exports_1("CallExpressionArgumentTypeQuery", CallExpressionArgumentTypeQuery);
            RouteConfigPropertyQuery = class RouteConfigPropertyQuery {
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
            };
            exports_1("RouteConfigPropertyQuery", RouteConfigPropertyQuery);
            LiteralArgumentValueCallExpressionQuery = class LiteralArgumentValueCallExpressionQuery {
                selectProperties(callExpression) {
                    if (callExpression.type !== "CallExpression") {
                        throw new core_1.BuilderError("Wrong type passed to query", callExpression);
                    }
                    const args = callExpression.arguments.filter((arg) => arg.type === "Literal");
                    return args.map((arg) => arg.value);
                }
            };
            exports_1("LiteralArgumentValueCallExpressionQuery", LiteralArgumentValueCallExpressionQuery);
        }
    };
});
