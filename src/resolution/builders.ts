import { Container } from "aurelia-dependency-injection";
import { CallExpression, FunctionDeclaration } from "../cherow/estree";
import { ICompleteRouteConfig, IRouteConfig } from "../interfaces";
import { $Constructor } from "../model";
import { Registry } from "../registry";
import { routerMetadata } from "../router-metadata";
import { RouterMetadataSettings } from "../router-metadata-configuration";
import { RouterResource } from "../router-resource";
import { ensureArray } from "../util";
import { NoResult } from "./core";
import { IBuilder, IBuilderContext, IPropertyQuery } from "./interfaces";
import { constructorRouteConfigMapper, objectRouteConfigMapper } from "./mapping";
import * as R from "./requests";

// tslint:disable:max-classes-per-file

/**
 * Base builder that provides a simple method to get the appropriate RouterMetadataSettings
 * for a given instruction
 */
export abstract class RouteConfigBuilder implements IBuilder {
  public abstract create(request: R.RouteConfigRequest, context: IBuilderContext): any;

  protected getSettings(request: R.RouteConfigRequest, context: IBuilderContext): RouterMetadataSettings {
    if (request.instruction.settings) {
      return request.instruction.settings;
    }

    return context.resolve(new R.RouterMetadataSettingsRequest(request.instruction.target));
  }
}

/**
 * Builder that aggregates the results from child builders to create fully enriched RouteConfigs
 * for a given instruction, from the perspective of the target module of a route.
 */
export class CompleteRouteConfigCollectionBuilder extends RouteConfigBuilder {
  public create(request: R.CompleteRouteConfigCollectionRequest, context: IBuilderContext): any {
    if (!(request instanceof R.CompleteRouteConfigCollectionRequest)) {
      return new NoResult();
    }

    const instruction = request.instruction;

    const result: ICompleteRouteConfig[] = [];
    const overrides = context.resolve(new R.RouteConfigOverridesRequest(instruction));
    const configCollection = context.resolve(new R.RouteConfigCollectionRequest(instruction));

    for (const config of configCollection) {
      config.route = ensureArray(config.route);
      for (const route of config.route) {
        result.push({ ...config, route, ...overrides });
      }
    }

    const settings = this.getSettings(request, context);

    return settings.transformRouteConfigs(result, request.instruction);
  }
}

/**
 * Builder that retrieves the convention- and property based RouteConfig defaults
 * for a given instruction, which are used as a seed for building the actual RouteConfigs
 */
export class RouteConfigDefaultsBuilder extends RouteConfigBuilder {
  public create(request: R.RouteConfigDefaultsRequest, context: IBuilderContext): any {
    if (!(request instanceof R.RouteConfigDefaultsRequest)) {
      return new NoResult();
    }

    const instruction = request.instruction;

    const result: IRouteConfig = Object.create(Object.prototype);
    const settings = this.getSettings(request, context);

    objectRouteConfigMapper.map(result, settings.routeConfigDefaults);

    const hyphenatedName = hyphenate(instruction.target.name);
    result.route = hyphenatedName;
    result.name = hyphenatedName;
    result.title = toTitle(instruction.target.name);

    constructorRouteConfigMapper.map(result, instruction.target);
    objectRouteConfigMapper.map(result, instruction.target.baseRoute);

    return result;
  }
}

/**
 * Builder that looks for any user-provided routes via the instruction or static properties
 * and merges them with the defaults returned from the DefaultsBuilder.
 * If no routes were specified, simply returns the defaults as a single RouteConfig.
 */
export class RouteConfigCollectionBuilder extends RouteConfigBuilder {
  public create(request: R.RouteConfigCollectionRequest, context: IBuilderContext): any {
    if (!(request instanceof R.RouteConfigCollectionRequest)) {
      return new NoResult();
    }

    const instruction = request.instruction;
    const result: IRouteConfig[] = [];

    const defaults = context.resolve(new R.RouteConfigDefaultsRequest(instruction));
    const propertyConfigs = ensureArray(instruction.target.routes);
    const instructionConfigs = ensureArray(instruction.routes);
    const configs = [...propertyConfigs, ...instructionConfigs];
    for (const config of configs) {
      result.push({ ...defaults, ...config });
    }
    if (result.length === 0) {
      result.push({ ...defaults });
    }

    return result;
  }
}

/**
 * Builder that retrieves the RouteConfigOverrides from the settings as well as
 * the moduleId from the instruction.
 */
export class RouteConfigOverridesBuilder extends RouteConfigBuilder {
  public create(request: R.RouteConfigOverridesRequest, context: IBuilderContext): any {
    if (!(request instanceof R.RouteConfigOverridesRequest)) {
      return new NoResult();
    }

    const instruction = request.instruction;

    const result: IRouteConfig = Object.create(Object.prototype);
    const settings = this.getSettings(request, context);

    objectRouteConfigMapper.map(result, settings.routeConfigOverrides);
    result.moduleId = instruction.moduleId;

    return result;
  }
}

/**
 * Builder that tries to return the most specific RouterMetadataSettings
 * for a given instruction.
 */
export class RouterMetadataSettingsProvider implements IBuilder {
  public create(request: any, context: IBuilderContext): any {
    let container: Container | undefined;

    if (request === RouterMetadataSettings) {
      container = context.resolve(Container);
    }

    if (request instanceof R.RouterMetadataSettingsRequest) {
      container = context.resolve(new R.ContainerRequest(request.target));
    }

    if (!container) {
      return new NoResult();
    }

    return container.get(RouterMetadataSettings);
  }
}

/**
 * Builder that tries to return the most specific Container
 * for a given instruction.
 */
export class ContainerProvider implements IBuilder {
  public create(request: any, context: IBuilderContext): any {
    if (request === Container) {
      return Container.instance;
    }

    if (request instanceof R.ContainerRequest) {
      const resource = context.resolve(new R.RouterResourceRequest(request.target)) as RouterResource;

      return (resource && resource.container) || Container.instance;
    }

    return new NoResult();
  }
}

/**
 * Builder that resolves the RouterResource for a given target.
 */
export class RouterResourceProvider implements IBuilder {
  public create(request: R.RouterResourceRequest, _: IBuilderContext): any {
    if (!(request instanceof R.RouterResourceRequest)) {
      return new NoResult();
    }

    return routerMetadata.getOrCreateOwn(request.target);
  }
}

/**
 * Builder that simply forwards a request to the most specific Container available,
 * but will only do so if that container actually has a resolver.
 * Otherwise, will return NoResult.
 */
export class ContainerRelay implements IBuilder {
  public container: Container | null;

  constructor(container: Container | null = null) {
    this.container = container;
  }

  public create(request: any, context: IBuilderContext): any {
    const container = this.container || (context.resolve(Container) as Container);
    if (!container) {
      return new NoResult();
    }
    if (!container.hasResolver(request)) {
      return new NoResult();
    }

    return container.get(request);
  }
}

function hyphenate(value: string): string {
  return (value.charAt(0).toLowerCase() + value.slice(1)).replace(
    /([A-Z])/g,
    (char: string) => `-${char.toLowerCase()}`
  );
}

function toTitle(value: string): string {
  return value.replace(/([A-Z])/g, (char: string) => ` ${char}`).trimLeft();
}

/**
 * Builder that aggregates the results from child builders to create fully enriched RouteConfigs
 * for a given instruction, from the perspective of the module that configures these routes.
 */
export class CompleteChildRouteConfigCollectionBuilder extends RouteConfigBuilder {
  public create(request: R.CompleteChildRouteConfigCollectionRequest, context: IBuilderContext): any {
    if (!(request instanceof R.CompleteChildRouteConfigCollectionRequest)) {
      return new NoResult();
    }

    let $constructor = request.$module && request.$module.$defaultExport && request.$module.$defaultExport.$constructor;
    if (!$constructor) {
      $constructor = context.resolve(new R.RegisteredConstructorRequest(request.instruction.target)) as $Constructor;
    }

    return context.resolve(new R.ChildRouteConfigCollectionRequest($constructor));
  }
}

/**
 * Builder that looks for childRoutes in any decorator-provided information and inside the function
 * body of "configureRouter()" (if there is any).
 */
export class ChildRouteConfigCollectionBuilder implements IBuilder {
  public create(request: R.ChildRouteConfigCollectionRequest, context: IBuilderContext): any {
    if (!(request instanceof R.ChildRouteConfigCollectionRequest)) {
      return new NoResult();
    }

    const results: IRouteConfig[] = [];
    const configCollection = context.resolve(request.$constructor) as IRouteConfig[];
    for (const config of configCollection) {
      config.route = ensureArray(config.route);
      if (config.route.length === 0) {
        results.push({ ...config });
      } else {
        for (const route of config.route) {
          results.push({ ...config, route });
        }
      }
    }

    return results;
  }
}

/**
 * Builder that tries to retrieve the registered $Constructor instance associated to the provided
 * target.
 */
export class RegisteredConstructorProvider implements IBuilder {
  public create(request: R.RegisteredConstructorRequest, context: IBuilderContext): any {
    if (!(request instanceof R.RegisteredConstructorRequest)) {
      return new NoResult();
    }

    const resource = context.resolve(new R.RouterResourceRequest(request.target)) as RouterResource;
    if (resource) {
      if (resource.$module && resource.$module.$defaultExport) {
        return resource.$module.$defaultExport.$constructor;
      } else if (resource.moduleId) {
        const registry = context.resolve(Registry) as Registry;
        const $module = registry.getModule(resource.moduleId);
        if ($module && $module.$defaultExport) {
          return $module.$defaultExport.$constructor;
        }
      }
    }

    return new NoResult();
  }
}

/**
 * Builder that forwards the results of running the provided query on the FunctionDeclaration's body
 * as individual requests, and returns the concatenated results of those requests.
 */
export class FunctionDeclarationAnalyzer implements IBuilder {
  public query: IPropertyQuery;
  constructor(query: IPropertyQuery) {
    this.query = query;
  }

  public create(request: FunctionDeclaration, context: IBuilderContext): any {
    if (request.type !== "FunctionDeclaration" || request.body.type !== "BlockStatement") {
      return new NoResult();
    }

    const results = [];
    const properties = this.query.selectProperties(request.body);
    for (const prop of properties) {
      const result = context.resolve(prop);
      if (Array.isArray(result)) {
        for (const item of result) {
          results.push(item);
        }
      } else {
        results.push(result);
      }
    }

    return results;
  }
}

export class CallExpressionAnalyzer implements IBuilder {
  public argumentQuery: IPropertyQuery;
  constructor(argumentQuery: IPropertyQuery) {
    this.argumentQuery = argumentQuery;
  }

  public create(request: CallExpression, context: IBuilderContext): any {
    if (request.type !== "CallExpression") {
      return new NoResult();
    }
    const results: any[] = [];
    const argsToProcess = this.argumentQuery.selectProperties(request);

    for (const arg of argsToProcess) {
      const result = context.resolve(new R.AnalyzeCallExpressionArgumentRequest(arg));
      if (Array.isArray(result)) {
        for (const item of result) {
          results.push(item);
        }
      } else {
        results.push(result);
      }
    }

    return results;
  }
}

export class CallExpressionArgumentAnalyzer implements IBuilder {
  public create(request: R.AnalyzeCallExpressionArgumentRequest, context: IBuilderContext): any {
    if (!(request instanceof R.AnalyzeCallExpressionArgumentRequest)) {
      return new NoResult();
    }

    const results: any[] = [];
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
}

export class PropertyAnalyzeRequestRelay implements IBuilder {
  public create(request: R.AnalyzePropertyRequest, context: IBuilderContext): any {
    if (!(request instanceof R.AnalyzePropertyRequest)) {
      return new NoResult();
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
          return new NoResult();
        }
      }
    }

    return new NoResult();
  }
}

export class ObjectExpressionAnalyzer implements IBuilder {
  public propertyQuery: IPropertyQuery;
  constructor(propertyQuery: IPropertyQuery) {
    this.propertyQuery = propertyQuery;
  }

  public create(request: R.AnalyzeObjectExpressionRequest, context: IBuilderContext): any {
    if (!(request instanceof R.AnalyzeObjectExpressionRequest)) {
      return new NoResult();
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
}

export class LiteralPropertyAnalyzer implements IBuilder {
  public create(request: R.AnalyzeLiteralPropertyRequest): any {
    if (!(request instanceof R.AnalyzeLiteralPropertyRequest)) {
      return new NoResult();
    }

    return request.value.value;
  }
}

export class CallExpressionPropertyAnalyzer implements IBuilder {
  public query: IPropertyQuery;
  constructor(query: IPropertyQuery) {
    this.query = query;
  }

  public create(request: R.AnalyzeCallExpressionPropertyRequest): any {
    if (!(request instanceof R.AnalyzeCallExpressionPropertyRequest)) {
      return new NoResult();
    }

    return this.query.selectProperties(request.value);
  }
}

export class ArrayExpressionPropertyAnalyzer implements IBuilder {
  public create(request: R.AnalyzeArrayExpressionPropertyRequest): any {
    if (!(request instanceof R.AnalyzeArrayExpressionPropertyRequest)) {
      return new NoResult();
    }

    const results: any[] = [];
    for (const el of request.value.elements) {
      if (el && el.type === "Literal") {
        results.push(el.value);
      }
    }

    return results;
  }
}

export class ObjectExpressionPropertyAnalyzer implements IBuilder {
  public create(request: R.AnalyzeObjectExpressionPropertyRequest, context: IBuilderContext): any {
    if (!(request instanceof R.AnalyzeObjectExpressionPropertyRequest)) {
      return new NoResult();
    }

    return context.resolve(new R.AnalyzeObjectExpressionRequest(request.value));
  }
}
