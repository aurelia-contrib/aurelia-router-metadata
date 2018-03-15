"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("@src/registry");
const core_1 = require("@src/resolution/core");
const mapping_1 = require("@src/resolution/mapping");
const requests_1 = require("@src/resolution/requests");
const router_metadata_1 = require("@src/router-metadata");
const router_metadata_configuration_1 = require("@src/router-metadata-configuration");
const util_1 = require("@src/util");
const aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
// tslint:disable:max-classes-per-file
/**
 * Base builder that provides a simple method to get the appropriate RouterMetadataSettings
 * for a given instruction
 */
class RouteConfigBuilder {
    getSettings(request, context) {
        if (request.instruction.settings) {
            return request.instruction.settings;
        }
        return context.resolve(new requests_1.RouterMetadataSettingsRequest(request.instruction.target));
    }
}
exports.RouteConfigBuilder = RouteConfigBuilder;
/**
 * Builder that aggregates the results from child builders to create fully enriched RouteConfigs
 * for a given instruction, from the perspective of the target module of a route.
 */
class CompleteRouteConfigCollectionBuilder extends RouteConfigBuilder {
    create(request, context) {
        if (!(request instanceof requests_1.CompleteRouteConfigCollectionRequest)) {
            return new core_1.NoResult();
        }
        const instruction = request.instruction;
        const result = [];
        const overrides = context.resolve(new requests_1.RouteConfigOverridesRequest(instruction));
        const configCollection = context.resolve(new requests_1.RouteConfigCollectionRequest(instruction));
        for (const config of configCollection) {
            config.route = util_1.ensureArray(config.route);
            for (const route of config.route) {
                result.push(Object.assign({}, config, { route }, overrides));
            }
        }
        const settings = this.getSettings(request, context);
        return settings.transformRouteConfigs(result, request.instruction);
    }
}
exports.CompleteRouteConfigCollectionBuilder = CompleteRouteConfigCollectionBuilder;
/**
 * Builder that retrieves the convention- and property based RouteConfig defaults
 * for a given instruction, which are used as a seed for building the actual RouteConfigs
 */
class RouteConfigDefaultsBuilder extends RouteConfigBuilder {
    create(request, context) {
        if (!(request instanceof requests_1.RouteConfigDefaultsRequest)) {
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
}
exports.RouteConfigDefaultsBuilder = RouteConfigDefaultsBuilder;
/**
 * Builder that looks for any user-provided routes via the instruction or static properties
 * and merges them with the defaults returned from the DefaultsBuilder.
 * If no routes were specified, simply returns the defaults as a single RouteConfig.
 */
class RouteConfigCollectionBuilder extends RouteConfigBuilder {
    create(request, context) {
        if (!(request instanceof requests_1.RouteConfigCollectionRequest)) {
            return new core_1.NoResult();
        }
        const instruction = request.instruction;
        const result = [];
        const defaults = context.resolve(new requests_1.RouteConfigDefaultsRequest(instruction));
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
}
exports.RouteConfigCollectionBuilder = RouteConfigCollectionBuilder;
/**
 * Builder that retrieves the RouteConfigOverrides from the settings as well as
 * the moduleId from the instruction.
 */
class RouteConfigOverridesBuilder extends RouteConfigBuilder {
    create(request, context) {
        if (!(request instanceof requests_1.RouteConfigOverridesRequest)) {
            return new core_1.NoResult();
        }
        const instruction = request.instruction;
        const result = Object.create(Object.prototype);
        const settings = this.getSettings(request, context);
        mapping_1.objectRouteConfigMapper.map(result, settings.routeConfigOverrides);
        result.moduleId = instruction.moduleId;
        return result;
    }
}
exports.RouteConfigOverridesBuilder = RouteConfigOverridesBuilder;
/**
 * Builder that tries to return the most specific RouterMetadataSettings
 * for a given instruction.
 */
class RouterMetadataSettingsProvider {
    create(request, context) {
        let container;
        if (request === router_metadata_configuration_1.RouterMetadataSettings) {
            container = context.resolve(aurelia_dependency_injection_1.Container);
        }
        if (request instanceof requests_1.RouterMetadataSettingsRequest) {
            container = context.resolve(new requests_1.ContainerRequest(request.target));
        }
        if (!container) {
            return new core_1.NoResult();
        }
        return container.get(router_metadata_configuration_1.RouterMetadataSettings);
    }
}
exports.RouterMetadataSettingsProvider = RouterMetadataSettingsProvider;
/**
 * Builder that tries to return the most specific Container
 * for a given instruction.
 */
class ContainerProvider {
    create(request, context) {
        if (request === aurelia_dependency_injection_1.Container) {
            return aurelia_dependency_injection_1.Container.instance;
        }
        if (request instanceof requests_1.ContainerRequest) {
            const resource = context.resolve(new requests_1.RouterResourceRequest(request.target));
            return (resource && resource.container) || aurelia_dependency_injection_1.Container.instance;
        }
        return new core_1.NoResult();
    }
}
exports.ContainerProvider = ContainerProvider;
/**
 * Builder that resolves the RouterResource for a given target.
 */
class RouterResourceProvider {
    create(request, _) {
        if (!(request instanceof requests_1.RouterResourceRequest)) {
            return new core_1.NoResult();
        }
        return router_metadata_1.routerMetadata.getOrCreateOwn(request.target);
    }
}
exports.RouterResourceProvider = RouterResourceProvider;
/**
 * Builder that simply forwards a request to the most specific Container available,
 * but will only do so if that container actually has a resolver.
 * Otherwise, will return NoResult.
 */
class ContainerRelay {
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
}
exports.ContainerRelay = ContainerRelay;
function hyphenate(value) {
    return (value.charAt(0).toLowerCase() + value.slice(1)).replace(/([A-Z])/g, (char) => `-${char.toLowerCase()}`);
}
function toTitle(value) {
    return value.replace(/([A-Z])/g, (char) => ` ${char}`).trimLeft();
}
/**
 * Builder that aggregates the results from child builders to create fully enriched RouteConfigs
 * for a given instruction, from the perspective of the module that configures these routes.
 */
class CompleteChildRouteConfigCollectionBuilder extends RouteConfigBuilder {
    create(request, context) {
        if (!(request instanceof requests_1.CompleteChildRouteConfigCollectionRequest)) {
            return new core_1.NoResult();
        }
        let $constructor = request.$module && request.$module.$defaultExport && request.$module.$defaultExport.$constructor;
        if (!$constructor) {
            $constructor = context.resolve(new requests_1.RegisteredConstructorRequest(request.instruction.target));
        }
        return context.resolve(new requests_1.ChildRouteConfigCollectionRequest($constructor));
    }
}
exports.CompleteChildRouteConfigCollectionBuilder = CompleteChildRouteConfigCollectionBuilder;
/**
 * Builder that looks for childRoutes in any decorator-provided information and inside the function
 * body of "configureRouter()" (if there is any).
 */
class ChildRouteConfigCollectionBuilder {
    create(request, context) {
        if (!(request instanceof requests_1.ChildRouteConfigCollectionRequest)) {
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
}
exports.ChildRouteConfigCollectionBuilder = ChildRouteConfigCollectionBuilder;
/**
 * Builder that tries to retrieve the registered $Constructor instance associated to the provided
 * target.
 */
class RegisteredConstructorProvider {
    create(request, context) {
        if (!(request instanceof requests_1.RegisteredConstructorRequest)) {
            return new core_1.NoResult();
        }
        const resource = context.resolve(new requests_1.RouterResourceRequest(request.target));
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
}
exports.RegisteredConstructorProvider = RegisteredConstructorProvider;
/**
 * Builder that forwards the results of running the provided query on the FunctionDeclaration's body
 * as individual requests, and returns the concatenated results of those requests.
 */
class FunctionDeclarationAnalyzer {
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
}
exports.FunctionDeclarationAnalyzer = FunctionDeclarationAnalyzer;
class CallExpressionAnalyzer {
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
            const result = context.resolve(new requests_1.AnalyzeCallExpressionArgumentRequest(arg));
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
}
exports.CallExpressionAnalyzer = CallExpressionAnalyzer;
class CallExpressionArgumentAnalyzer {
    create(request, context) {
        if (!(request instanceof requests_1.AnalyzeCallExpressionArgumentRequest)) {
            return new core_1.NoResult();
        }
        const results = [];
        const arg = request.expression;
        switch (arg.type) {
            case "ArrayExpression": {
                for (const el of arg.elements) {
                    if (el && el.type === "ObjectExpression") {
                        results.push(context.resolve(new requests_1.AnalyzeObjectExpressionRequest(el)));
                    }
                }
                break;
            }
            case "ObjectExpression": {
                results.push(context.resolve(new requests_1.AnalyzeObjectExpressionRequest(arg)));
                break;
            }
            default: {
                // ignore
            }
        }
        return results;
    }
}
exports.CallExpressionArgumentAnalyzer = CallExpressionArgumentAnalyzer;
class PropertyAnalyzeRequestRelay {
    create(request, context) {
        if (!(request instanceof requests_1.AnalyzePropertyRequest)) {
            return new core_1.NoResult();
        }
        if (request.property.value) {
            switch (request.property.value.type) {
                case "Literal": {
                    return context.resolve(new requests_1.AnalyzeLiteralPropertyRequest(request.property));
                }
                case "CallExpression": {
                    return context.resolve(new requests_1.AnalyzeCallExpressionPropertyRequest(request.property));
                }
                case "ArrayExpression": {
                    return context.resolve(new requests_1.AnalyzeArrayExpressionPropertyRequest(request.property));
                }
                case "ObjectExpression": {
                    return context.resolve(new requests_1.AnalyzeObjectExpressionPropertyRequest(request.property));
                }
                default: {
                    return new core_1.NoResult();
                }
            }
        }
        return new core_1.NoResult();
    }
}
exports.PropertyAnalyzeRequestRelay = PropertyAnalyzeRequestRelay;
class ObjectExpressionAnalyzer {
    constructor(propertyQuery) {
        this.propertyQuery = propertyQuery;
    }
    create(request, context) {
        if (!(request instanceof requests_1.AnalyzeObjectExpressionRequest)) {
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
                        const propertyResult = context.resolve(new requests_1.AnalyzePropertyRequest(prop));
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
}
exports.ObjectExpressionAnalyzer = ObjectExpressionAnalyzer;
class LiteralPropertyAnalyzer {
    create(request) {
        if (!(request instanceof requests_1.AnalyzeLiteralPropertyRequest)) {
            return new core_1.NoResult();
        }
        return request.value.value;
    }
}
exports.LiteralPropertyAnalyzer = LiteralPropertyAnalyzer;
class CallExpressionPropertyAnalyzer {
    constructor(query) {
        this.query = query;
    }
    create(request) {
        if (!(request instanceof requests_1.AnalyzeCallExpressionPropertyRequest)) {
            return new core_1.NoResult();
        }
        return this.query.selectProperties(request.value);
    }
}
exports.CallExpressionPropertyAnalyzer = CallExpressionPropertyAnalyzer;
class ArrayExpressionPropertyAnalyzer {
    create(request) {
        if (!(request instanceof requests_1.AnalyzeArrayExpressionPropertyRequest)) {
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
}
exports.ArrayExpressionPropertyAnalyzer = ArrayExpressionPropertyAnalyzer;
class ObjectExpressionPropertyAnalyzer {
    create(request, context) {
        if (!(request instanceof requests_1.AnalyzeObjectExpressionPropertyRequest)) {
            return new core_1.NoResult();
        }
        return context.resolve(new requests_1.AnalyzeObjectExpressionRequest(request.value));
    }
}
exports.ObjectExpressionPropertyAnalyzer = ObjectExpressionPropertyAnalyzer;
