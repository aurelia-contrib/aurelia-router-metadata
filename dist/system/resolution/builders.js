System.register(["aurelia-dependency-injection", "../registry", "../router-metadata", "../router-metadata-configuration", "../util", "./core", "./mapping", "./requests"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function hyphenate(value) {
        return (value.charAt(0).toLowerCase() + value.slice(1)).replace(/([A-Z])/g, (char) => `-${char.toLowerCase()}`);
    }
    function toTitle(value) {
        return value.replace(/([A-Z])/g, (char) => ` ${char}`).trimLeft();
    }
    var aurelia_dependency_injection_1, registry_1, router_metadata_1, router_metadata_configuration_1, util_1, core_1, mapping_1, R, RouteConfigBuilder, CompleteRouteConfigCollectionBuilder, RouteConfigDefaultsBuilder, RouteConfigCollectionBuilder, RouteConfigOverridesBuilder, RouterMetadataSettingsProvider, ContainerProvider, RouterResourceProvider, ContainerRelay, CompleteChildRouteConfigCollectionBuilder, ChildRouteConfigCollectionBuilder, RegisteredConstructorProvider, FunctionDeclarationAnalyzer, CallExpressionAnalyzer, CallExpressionArgumentAnalyzer, PropertyAnalyzeRequestRelay, ObjectExpressionAnalyzer, LiteralPropertyAnalyzer, CallExpressionPropertyAnalyzer, ArrayExpressionPropertyAnalyzer, ObjectExpressionPropertyAnalyzer;
    return {
        setters: [
            function (aurelia_dependency_injection_1_1) {
                aurelia_dependency_injection_1 = aurelia_dependency_injection_1_1;
            },
            function (registry_1_1) {
                registry_1 = registry_1_1;
            },
            function (router_metadata_1_1) {
                router_metadata_1 = router_metadata_1_1;
            },
            function (router_metadata_configuration_1_1) {
                router_metadata_configuration_1 = router_metadata_configuration_1_1;
            },
            function (util_1_1) {
                util_1 = util_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (mapping_1_1) {
                mapping_1 = mapping_1_1;
            },
            function (R_1) {
                R = R_1;
            }
        ],
        execute: function () {
            // tslint:disable:max-classes-per-file
            /**
             * Base builder that provides a simple method to get the appropriate RouterMetadataSettings
             * for a given instruction
             */
            RouteConfigBuilder = class RouteConfigBuilder {
                getSettings(request, context) {
                    if (request.instruction.settings) {
                        return request.instruction.settings;
                    }
                    return context.resolve(new R.RouterMetadataSettingsRequest(request.instruction.target));
                }
            };
            exports_1("RouteConfigBuilder", RouteConfigBuilder);
            /**
             * Builder that aggregates the results from child builders to create fully enriched RouteConfigs
             * for a given instruction, from the perspective of the target module of a route.
             */
            CompleteRouteConfigCollectionBuilder = class CompleteRouteConfigCollectionBuilder extends RouteConfigBuilder {
                create(request, context) {
                    if (!(request instanceof R.CompleteRouteConfigCollectionRequest)) {
                        return new core_1.NoResult();
                    }
                    const instruction = request.instruction;
                    const result = [];
                    const overrides = context.resolve(new R.RouteConfigOverridesRequest(instruction));
                    const configCollection = context.resolve(new R.RouteConfigCollectionRequest(instruction));
                    for (const config of configCollection) {
                        config.route = util_1.ensureArray(config.route);
                        for (const route of config.route) {
                            result.push(Object.assign({}, config, { route }, overrides));
                        }
                    }
                    const settings = this.getSettings(request, context);
                    return settings.transformRouteConfigs(result, request.instruction);
                }
            };
            exports_1("CompleteRouteConfigCollectionBuilder", CompleteRouteConfigCollectionBuilder);
            /**
             * Builder that retrieves the convention- and property based RouteConfig defaults
             * for a given instruction, which are used as a seed for building the actual RouteConfigs
             */
            RouteConfigDefaultsBuilder = class RouteConfigDefaultsBuilder extends RouteConfigBuilder {
                create(request, context) {
                    if (!(request instanceof R.RouteConfigDefaultsRequest)) {
                        return new core_1.NoResult();
                    }
                    const instruction = request.instruction;
                    const result = Object.create(Object.prototype);
                    const settings = this.getSettings(request, context);
                    mapping_1.objectRouteConfigMapper.map(result, settings.routeConfigDefaults);
                    const hyphenatedName = hyphenate(instruction.target.name);
                    result.route = hyphenatedName;
                    result.name = hyphenatedName;
                    result.title = toTitle(instruction.target.name);
                    mapping_1.constructorRouteConfigMapper.map(result, instruction.target);
                    mapping_1.objectRouteConfigMapper.map(result, instruction.target.baseRoute);
                    return result;
                }
            };
            exports_1("RouteConfigDefaultsBuilder", RouteConfigDefaultsBuilder);
            /**
             * Builder that looks for any user-provided routes via the instruction or static properties
             * and merges them with the defaults returned from the DefaultsBuilder.
             * If no routes were specified, simply returns the defaults as a single RouteConfig.
             */
            RouteConfigCollectionBuilder = class RouteConfigCollectionBuilder extends RouteConfigBuilder {
                create(request, context) {
                    if (!(request instanceof R.RouteConfigCollectionRequest)) {
                        return new core_1.NoResult();
                    }
                    const instruction = request.instruction;
                    const result = [];
                    const defaults = context.resolve(new R.RouteConfigDefaultsRequest(instruction));
                    const propertyConfigs = util_1.ensureArray(instruction.target.routes);
                    const instructionConfigs = util_1.ensureArray(instruction.routes);
                    const configs = [...propertyConfigs, ...instructionConfigs];
                    for (const config of configs) {
                        result.push(Object.assign({}, defaults, config));
                    }
                    if (result.length === 0) {
                        result.push(Object.assign({}, defaults));
                    }
                    return result;
                }
            };
            exports_1("RouteConfigCollectionBuilder", RouteConfigCollectionBuilder);
            /**
             * Builder that retrieves the RouteConfigOverrides from the settings as well as
             * the moduleId from the instruction.
             */
            RouteConfigOverridesBuilder = class RouteConfigOverridesBuilder extends RouteConfigBuilder {
                create(request, context) {
                    if (!(request instanceof R.RouteConfigOverridesRequest)) {
                        return new core_1.NoResult();
                    }
                    const instruction = request.instruction;
                    const result = Object.create(Object.prototype);
                    const settings = this.getSettings(request, context);
                    mapping_1.objectRouteConfigMapper.map(result, settings.routeConfigOverrides);
                    result.moduleId = instruction.moduleId;
                    return result;
                }
            };
            exports_1("RouteConfigOverridesBuilder", RouteConfigOverridesBuilder);
            /**
             * Builder that tries to return the most specific RouterMetadataSettings
             * for a given instruction.
             */
            RouterMetadataSettingsProvider = class RouterMetadataSettingsProvider {
                create(request, context) {
                    let container;
                    if (request === router_metadata_configuration_1.RouterMetadataSettings) {
                        container = context.resolve(aurelia_dependency_injection_1.Container);
                    }
                    if (request instanceof R.RouterMetadataSettingsRequest) {
                        container = context.resolve(new R.ContainerRequest(request.target));
                    }
                    if (!container) {
                        return new core_1.NoResult();
                    }
                    return container.get(router_metadata_configuration_1.RouterMetadataSettings);
                }
            };
            exports_1("RouterMetadataSettingsProvider", RouterMetadataSettingsProvider);
            /**
             * Builder that tries to return the most specific Container
             * for a given instruction.
             */
            ContainerProvider = class ContainerProvider {
                create(request, context) {
                    if (request === aurelia_dependency_injection_1.Container) {
                        return aurelia_dependency_injection_1.Container.instance;
                    }
                    if (request instanceof R.ContainerRequest) {
                        const resource = context.resolve(new R.RouterResourceRequest(request.target));
                        return (resource && resource.container) || aurelia_dependency_injection_1.Container.instance;
                    }
                    return new core_1.NoResult();
                }
            };
            exports_1("ContainerProvider", ContainerProvider);
            /**
             * Builder that resolves the RouterResource for a given target.
             */
            RouterResourceProvider = class RouterResourceProvider {
                create(request, _) {
                    if (!(request instanceof R.RouterResourceRequest)) {
                        return new core_1.NoResult();
                    }
                    return router_metadata_1.routerMetadata.getOrCreateOwn(request.target);
                }
            };
            exports_1("RouterResourceProvider", RouterResourceProvider);
            /**
             * Builder that simply forwards a request to the most specific Container available,
             * but will only do so if that container actually has a resolver.
             * Otherwise, will return NoResult.
             */
            ContainerRelay = class ContainerRelay {
                constructor(container = null) {
                    this.container = container;
                }
                create(request, context) {
                    const container = this.container || context.resolve(aurelia_dependency_injection_1.Container);
                    if (!container) {
                        return new core_1.NoResult();
                    }
                    if (!container.hasResolver(request)) {
                        return new core_1.NoResult();
                    }
                    return container.get(request);
                }
            };
            exports_1("ContainerRelay", ContainerRelay);
            /**
             * Builder that aggregates the results from child builders to create fully enriched RouteConfigs
             * for a given instruction, from the perspective of the module that configures these routes.
             */
            CompleteChildRouteConfigCollectionBuilder = class CompleteChildRouteConfigCollectionBuilder extends RouteConfigBuilder {
                create(request, context) {
                    if (!(request instanceof R.CompleteChildRouteConfigCollectionRequest)) {
                        return new core_1.NoResult();
                    }
                    let $constructor = request.$module && request.$module.$defaultExport && request.$module.$defaultExport.$constructor;
                    if (!$constructor) {
                        $constructor = context.resolve(new R.RegisteredConstructorRequest(request.instruction.target));
                    }
                    return context.resolve(new R.ChildRouteConfigCollectionRequest($constructor));
                }
            };
            exports_1("CompleteChildRouteConfigCollectionBuilder", CompleteChildRouteConfigCollectionBuilder);
            /**
             * Builder that looks for childRoutes in any decorator-provided information and inside the function
             * body of "configureRouter()" (if there is any).
             */
            ChildRouteConfigCollectionBuilder = class ChildRouteConfigCollectionBuilder {
                create(request, context) {
                    if (!(request instanceof R.ChildRouteConfigCollectionRequest)) {
                        return new core_1.NoResult();
                    }
                    const results = [];
                    const configCollection = context.resolve(request.$constructor);
                    for (const config of configCollection) {
                        config.route = util_1.ensureArray(config.route);
                        if (config.route.length === 0) {
                            results.push(Object.assign({}, config));
                        }
                        else {
                            for (const route of config.route) {
                                results.push(Object.assign({}, config, { route }));
                            }
                        }
                    }
                    return results;
                }
            };
            exports_1("ChildRouteConfigCollectionBuilder", ChildRouteConfigCollectionBuilder);
            /**
             * Builder that tries to retrieve the registered $Constructor instance associated to the provided
             * target.
             */
            RegisteredConstructorProvider = class RegisteredConstructorProvider {
                create(request, context) {
                    if (!(request instanceof R.RegisteredConstructorRequest)) {
                        return new core_1.NoResult();
                    }
                    const resource = context.resolve(new R.RouterResourceRequest(request.target));
                    if (resource) {
                        if (resource.$module && resource.$module.$defaultExport) {
                            return resource.$module.$defaultExport.$constructor;
                        }
                        else if (resource.moduleId) {
                            const registry = context.resolve(registry_1.Registry);
                            const $module = registry.getModule(resource.moduleId);
                            if ($module && $module.$defaultExport) {
                                return $module.$defaultExport.$constructor;
                            }
                        }
                    }
                    return new core_1.NoResult();
                }
            };
            exports_1("RegisteredConstructorProvider", RegisteredConstructorProvider);
            /**
             * Builder that forwards the results of running the provided query on the FunctionDeclaration's body
             * as individual requests, and returns the concatenated results of those requests.
             */
            FunctionDeclarationAnalyzer = class FunctionDeclarationAnalyzer {
                constructor(query) {
                    this.query = query;
                }
                create(request, context) {
                    if (request.type !== "FunctionDeclaration" || request.body.type !== "BlockStatement") {
                        return new core_1.NoResult();
                    }
                    const results = [];
                    const properties = this.query.selectProperties(request.body);
                    for (const prop of properties) {
                        const result = context.resolve(prop);
                        if (Array.isArray(result)) {
                            for (const item of result) {
                                results.push(item);
                            }
                        }
                        else {
                            results.push(result);
                        }
                    }
                    return results;
                }
            };
            exports_1("FunctionDeclarationAnalyzer", FunctionDeclarationAnalyzer);
            CallExpressionAnalyzer = class CallExpressionAnalyzer {
                constructor(argumentQuery) {
                    this.argumentQuery = argumentQuery;
                }
                create(request, context) {
                    if (request.type !== "CallExpression") {
                        return new core_1.NoResult();
                    }
                    const results = [];
                    const argsToProcess = this.argumentQuery.selectProperties(request);
                    for (const arg of argsToProcess) {
                        const result = context.resolve(new R.AnalyzeCallExpressionArgumentRequest(arg));
                        if (Array.isArray(result)) {
                            for (const item of result) {
                                results.push(item);
                            }
                        }
                        else {
                            results.push(result);
                        }
                    }
                    return results;
                }
            };
            exports_1("CallExpressionAnalyzer", CallExpressionAnalyzer);
            CallExpressionArgumentAnalyzer = class CallExpressionArgumentAnalyzer {
                create(request, context) {
                    if (!(request instanceof R.AnalyzeCallExpressionArgumentRequest)) {
                        return new core_1.NoResult();
                    }
                    const results = [];
                    const arg = request.expression;
                    switch (arg.type) {
                        case "ArrayExpression": {
                            for (const el of arg.elements) {
                                if (el && el.type === "ObjectExpression") {
                                    results.push(context.resolve(new R.AnalyzeObjectExpressionRequest(el)));
                                }
                            }
                            break;
                        }
                        case "ObjectExpression": {
                            results.push(context.resolve(new R.AnalyzeObjectExpressionRequest(arg)));
                            break;
                        }
                        default: {
                            // ignore
                        }
                    }
                    return results;
                }
            };
            exports_1("CallExpressionArgumentAnalyzer", CallExpressionArgumentAnalyzer);
            PropertyAnalyzeRequestRelay = class PropertyAnalyzeRequestRelay {
                create(request, context) {
                    if (!(request instanceof R.AnalyzePropertyRequest)) {
                        return new core_1.NoResult();
                    }
                    if (request.property.value) {
                        switch (request.property.value.type) {
                            case "Literal": {
                                return context.resolve(new R.AnalyzeLiteralPropertyRequest(request.property));
                            }
                            case "CallExpression": {
                                return context.resolve(new R.AnalyzeCallExpressionPropertyRequest(request.property));
                            }
                            case "ArrayExpression": {
                                return context.resolve(new R.AnalyzeArrayExpressionPropertyRequest(request.property));
                            }
                            case "ObjectExpression": {
                                return context.resolve(new R.AnalyzeObjectExpressionPropertyRequest(request.property));
                            }
                            default: {
                                return new core_1.NoResult();
                            }
                        }
                    }
                    return new core_1.NoResult();
                }
            };
            exports_1("PropertyAnalyzeRequestRelay", PropertyAnalyzeRequestRelay);
            ObjectExpressionAnalyzer = class ObjectExpressionAnalyzer {
                constructor(propertyQuery) {
                    this.propertyQuery = propertyQuery;
                }
                create(request, context) {
                    if (!(request instanceof R.AnalyzeObjectExpressionRequest)) {
                        return new core_1.NoResult();
                    }
                    const objectResult = Object.create(Object.prototype);
                    const properties = this.propertyQuery.selectProperties(request.expression);
                    for (const prop of properties) {
                        if (prop.type === "Property" && prop.value && prop.key.type === "Identifier") {
                            switch (prop.value.type) {
                                case "Literal":
                                case "CallExpression":
                                case "ArrayExpression":
                                case "ObjectExpression": {
                                    const propertyResult = context.resolve(new R.AnalyzePropertyRequest(prop));
                                    objectResult[prop.key.name] = propertyResult;
                                }
                                default: {
                                    // ignore
                                }
                            }
                        }
                    }
                    return objectResult;
                }
            };
            exports_1("ObjectExpressionAnalyzer", ObjectExpressionAnalyzer);
            LiteralPropertyAnalyzer = class LiteralPropertyAnalyzer {
                create(request) {
                    if (!(request instanceof R.AnalyzeLiteralPropertyRequest)) {
                        return new core_1.NoResult();
                    }
                    return request.value.value;
                }
            };
            exports_1("LiteralPropertyAnalyzer", LiteralPropertyAnalyzer);
            CallExpressionPropertyAnalyzer = class CallExpressionPropertyAnalyzer {
                constructor(query) {
                    this.query = query;
                }
                create(request) {
                    if (!(request instanceof R.AnalyzeCallExpressionPropertyRequest)) {
                        return new core_1.NoResult();
                    }
                    return this.query.selectProperties(request.value);
                }
            };
            exports_1("CallExpressionPropertyAnalyzer", CallExpressionPropertyAnalyzer);
            ArrayExpressionPropertyAnalyzer = class ArrayExpressionPropertyAnalyzer {
                create(request) {
                    if (!(request instanceof R.AnalyzeArrayExpressionPropertyRequest)) {
                        return new core_1.NoResult();
                    }
                    const results = [];
                    for (const el of request.value.elements) {
                        if (el && el.type === "Literal") {
                            results.push(el.value);
                        }
                    }
                    return results;
                }
            };
            exports_1("ArrayExpressionPropertyAnalyzer", ArrayExpressionPropertyAnalyzer);
            ObjectExpressionPropertyAnalyzer = class ObjectExpressionPropertyAnalyzer {
                create(request, context) {
                    if (!(request instanceof R.AnalyzeObjectExpressionPropertyRequest)) {
                        return new core_1.NoResult();
                    }
                    return context.resolve(new R.AnalyzeObjectExpressionRequest(request.value));
                }
            };
            exports_1("ObjectExpressionPropertyAnalyzer", ObjectExpressionPropertyAnalyzer);
        }
    };
});
//# sourceMappingURL=builders.js.map