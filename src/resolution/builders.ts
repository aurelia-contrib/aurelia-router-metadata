import { Container } from "aurelia-dependency-injection";
import * as cw from "cherow";
import {
  ICompleteRouteConfig,
  IConfigureRouterInstruction as IConfigInstruction,
  ICreateRouteConfigInstruction as ICreateInstruction,
  IRouteConfig,
  IRouterResourceTarget
} from "../interfaces";
import { $Constructor, $Module, $Property } from "../model";
import { Registry } from "../registry";
import { routerMetadata } from "../router-metadata";
import { RouterMetadataSettings } from "../router-metadata-configuration";
import { RouterResource } from "../router-resource";
import { ensureArray } from "../util";
import { Construct, Create, Execute, SelectProperties } from "./interfaces";
import { objectRouteConfigMapper } from "./mapping";

/**
 * Creates fully enriched RouteConfigs for a given instruction, where the instruction's target
 * is the route to be navigated **to**.
 */
export function buildRouteConfigCollection(
  instruction: ICreateInstruction
): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]> {
  const result: ICompleteRouteConfig[] = [];
  const defaults = getRouteConfigDefaults(instruction);
  const overrides = buildRouteConfigOverrides(instruction);
  const configs = getMetadataRoutes(instruction);
  // if there are no configs on any static properties, use the convention-based defaults for the target
  if (configs.length === 0) {
    configs.push(defaults);
  }

  let i = configs.length;
  while (i--) {
    const config: ICompleteRouteConfig = {} as any;
    mergeRouteConfig(config, defaults);
    mergeRouteConfig(config, configs[i]);

    if (Array.isArray(config.route)) {
      let j = config.route.length;
      while (j--) {
        const multiConfig: ICompleteRouteConfig = {} as any;
        mergeRouteConfig(multiConfig, config);
        multiConfig.route = config.route[j];
        mergeRouteConfig(multiConfig, overrides);
        result.push(multiConfig);
      }
    } else {
      mergeRouteConfig(config, overrides);
      result.push(config);
    }
  }

  const settings = getSettings(instruction);

  return settings.transformRouteConfigs(result, instruction);
}

const getRouteConfigDefaults = (instruction: ICreateInstruction) => {
  const result: IRouteConfig = {};
  const settings = getSettings(instruction);

  mergeRouteConfig(result, settings.routeConfigDefaults);

  const hyphenatedName = hyphenate(instruction.target.name);
  result.route = hyphenatedName;
  result.name = hyphenatedName;
  result.title = toTitle(instruction.target.name);

  mergeRouteConfig(result, instruction.target);
  mergeRouteConfig(result, instruction.target.baseRoute);

  return result;
};

const getRouterResource = (x: IRouterResourceTarget) => {
  return routerMetadata.getOrCreateOwn(x);
};
const getContainerFromRouterResource = (x: RouterResource) => {
  return (x && x.container) || Container.instance;
};
const getContainer = (x: Function | IRouterResourceTarget) => {
  return x === Container ? Container.instance : getContainerFromRouterResource(getRouterResource(x));
};

const getSettings = (x: ICreateInstruction) => {
  return x.settings ? x.settings : getContainer(x.target).get(RouterMetadataSettings);
};
const getMetadataRoutes = (x: ICreateInstruction) => {
  return ensureArray<IRouteConfig>(x.routes).concat(ensureArray(x.target.routes));
};
const mergeRouteConfig = (target: IRouteConfig, source?: IRouteConfig) => {
  if (!source) {
    return;
  }
  const keys = Object.keys(source);
  let i = keys.length;
  while (i--) {
    const key = keys[i];
    switch (key) {
      case "route":
      case "moduleId":
      case "redirect":
      case "navigationStrategy":
      case "viewPorts":
      case "nav":
      case "href":
      case "generationUsesHref":
      case "title":
      case "navModel":
      case "caseSensitive":
      case "activationStrategy":
      case "layoutView":
      case "layoutViewModel":
      case "layoutModel":
      case "name":
        target[key] = source[key];
        break;
      case "routeName":
        target.name = source.routeName;
        break;
      case "settings":
        if (!target.settings) {
          target.settings = {};
        }
        Object.assign(target.settings, source.settings);
        break;
      default: // no default
    }
  }
};

const buildRouteConfigOverrides = (instruction: ICreateInstruction) => {
  const result: IRouteConfig = {};
  const settings = getSettings(instruction);

  mergeRouteConfig(result, settings.routeConfigOverrides);
  result.moduleId = instruction.moduleId;
  if (!result.settings) {
    result.settings = {};
  }

  return result;
};

/**
 * Relays a request to the most specific Container available,
 * but will only do so if that container actually has a resolver.
 * Otherwise, will throw
 */
export function relayToContainer<T extends new (...args: any[]) => any>(request: T): InstanceType<T> {
  const container = getContainer(Container);
  if (!container) {
    throw new Error();
  }
  if (!container.hasResolver(request)) {
    throw new Error();
  }

  return container.get(request);
}

function hyphenate(value: string): string {
  return (value.charAt(0).toLowerCase() + value.slice(1)).replace(/([A-Z])/g, (char: string) => `-${char.toLowerCase()}`);
}

function toTitle(value: string): string {
  return value.replace(/([A-Z])/g, (char: string) => ` ${char}`).trimLeft();
}

/**
 * Aggregates the results from child builders to create fully enriched RouteConfigs
 * for a given instruction, from the perspective of the module that configures these routes.
 */
export function buildCompleteChildRouteConfigCollection(instruction: IConfigInstruction, $module?: $Module): any {
  let $constructor = $module && $module.$defaultExport && $module.$defaultExport.$constructor;
  if (!$constructor) {
    $constructor = getRegisteredConstructor(instruction.target);
  }

  const collection = buildChildRouteConfigCollection($constructor);

  return splitRouteConfig(collection);
}

/**
 * Looks for childRoutes in any decorator-provided information and inside the function
 * body of "configureRouter()" (if there is any).
 */
export function buildChildRouteConfigCollection($constructor: $Constructor): any {
  const results: IRouteConfig[] = [];

  const parseFunctionBody = createFunctionBodyParser(getConfigureRouterMethod);
  const functionDeclaration = parseFunctionBody($constructor);
  const selectFunctionDeclarations = createBlockStatementCallExpressionCalleePropertyNameQuery("map");
  const analyzeFunctionDeclaration = createFunctionDeclarationAnalyzer(selectFunctionDeclarations);
  const configCollection = analyzeFunctionDeclaration(functionDeclaration);
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

/**
 * Retrieves the registered $Constructor instance associated to the provided target.
 */
export function getRegisteredConstructor(target: IRouterResourceTarget): $Constructor {
  const resource = getRouterResource(target);
  if (!resource) {
    throw new Error();
  }

  if (resource.$module && resource.$module.$defaultExport) {
    return resource.$module.$defaultExport.$constructor;
  } else if (resource.moduleId) {
    const registry = relayToContainer(Registry);
    const $module = registry.getModule(resource.moduleId);
    if ($module && $module.$defaultExport) {
      return $module.$defaultExport.$constructor;
    }
  }

  throw new Error();
}

/**
 * Returns a function that forwards the results of running the provided query on the FunctionDeclaration's body
 * as individual requests, and returns the concatenated results of those requests.
 */
export function createFunctionDeclarationAnalyzer(
  selectProperties: SelectProperties<cw.BlockStatement, cw.CallExpression>
): Create<cw.FunctionDeclaration, IRouteConfig[]> {
  return request => {
    if (request.type !== "FunctionDeclaration" || request.body.type !== "BlockStatement") {
      throw new Error();
    }

    const results: IRouteConfig[] = [];
    const properties = selectProperties(request.body);
    const selectCallExpressionArguments = createCallExpressionArgumentTypeQuery(["ArrayExpression", "ObjectExpression"]);
    const analyzeCallExpression = createCallExpressionAnalyzer(selectCallExpressionArguments);
    for (const prop of properties) {
      const result = analyzeCallExpression(prop);
      for (const item of result) {
        results.push(item);
      }
    }

    return results;
  };
}

export function createCallExpressionAnalyzer(
  selectArguments: SelectProperties<cw.CallExpression, cw.Expression | cw.SpreadElement>
): Create<cw.CallExpression, IRouteConfig[]> {
  return request => {
    if (request.type !== "CallExpression") {
      throw new Error();
    }
    const results: IRouteConfig[] = [];
    const argsToProcess = selectArguments(request);

    for (const arg of argsToProcess) {
      const result = analyzeCallExpressionArgument(arg);
      for (const item of result) {
        results.push(item);
      }
    }

    return results;
  };
}

export function analyzeCallExpressionArgument(arg: cw.Expression | cw.SpreadElement): IRouteConfig[] {
  const propertyNames = objectRouteConfigMapper.mappings.map(m => m.targetName);
  const selectRouteConfigProperties = createRouteConfigPropertyQuery(propertyNames);
  const analyzeObjectExpression = createObjectExpressionAnalyzer(selectRouteConfigProperties);
  const results: IRouteConfig[] = [];
  switch (arg.type) {
    case "ArrayExpression": {
      for (const el of arg.elements) {
        if (el && el.type === "ObjectExpression") {
          results.push(analyzeObjectExpression(el));
        }
      }
      break;
    }
    case "ObjectExpression": {
      results.push(analyzeObjectExpression(arg));
      break;
    }
    default: {
      // ignore
    }
  }

  return results;
}

export function createObjectExpressionAnalyzer(selectProperties: SelectProperties<cw.ObjectExpression, cw.Property>): Create<cw.ObjectExpression, any> {
  return expression => {
    const objectResult: { [key: string]: any } = {};
    const properties = selectProperties(expression);
    for (const prop of properties) {
      if (prop.type === "Property" && prop.value && prop.key.type === "Identifier") {
        switch (prop.value.type) {
          case "Literal":
            objectResult[prop.key.name] = analyzeLiteralProperty(prop);
            break;
          case "CallExpression":
            const callExpressionArgumentTypeQuery = createCallExpressionArgumentTypeQuery(["ArrayExpression", "ObjectExpression"]);
            const analyzeCallExpressionProperty = createCallExpressionPropertyAnalyzer(callExpressionArgumentTypeQuery);
            objectResult[prop.key.name] = analyzeCallExpressionProperty(prop);
            break;
          case "ArrayExpression":
            objectResult[prop.key.name] = analyzeArrayExpressionProperty(prop);
            break;
          case "ObjectExpression": {
            const analyzeObjectExpression = createObjectExpressionAnalyzer(selectProperties);
            objectResult[prop.key.name] = analyzeObjectExpression(prop.value);
          }
          default: {
            // ignore
          }
        }
      }
    }

    return objectResult;
  };
}

export function analyzeLiteralProperty(prop: cw.Property): string | number | boolean | RegExp | null {
  if (prop.type === "Property" && prop.value && prop.key.type === "Identifier" && prop.value.type === "Literal") {
    return prop.value.value;
  }
  throw new Error();
}

export function createCallExpressionPropertyAnalyzer(
  selectProperties: SelectProperties<cw.CallExpression, cw.Expression | cw.SpreadElement>
): Create<cw.Property, (cw.Expression | cw.SpreadElement)[]> {
  return prop => {
    if (prop.type === "Property" && prop.value && prop.key.type === "Identifier" && prop.value.type === "CallExpression") {
      return selectProperties(prop.value);
    }
    throw new Error();
  };
}

export function analyzeArrayExpressionProperty(prop: cw.Property): any {
  if (prop.type === "Property" && prop.value && prop.key.type === "Identifier" && prop.value.type === "ArrayExpression") {
    const results: any[] = [];
    for (const el of prop.value.elements) {
      if (el && el.type === "Literal") {
        results.push(el.value);
      }
    }

    return results;
  }
  throw new Error();
}

/**
 * Returns a function that ensures the specified property name will always be an object.
 */
export function createObjectPropertyEnsurer<T extends { [key: string]: any }>(propertyName: string): Execute<T, T> {
  return result => {
    result[propertyName] = { ...result[propertyName] };

    return result;
  };
}

/**
 * Returns a function that uses cherow to parse the body of the first function returned by the PropertyQuery,
 * and then returns the FunctionDeclaration out of the parsed result.
 */
export function createFunctionBodyParser(selectProperties: SelectProperties<$Constructor, $Property>): Execute<$Constructor, cw.FunctionDeclaration> {
  return result => {
    for (const property of selectProperties(result)) {
      let body = property.descriptor.value.toString();
      // ensure we have a pattern "function functionName()" for the parser
      if (/^function *\(/.test(body)) {
        // regular named functions become "function()" when calling .toString() on the value
        body = body.replace(/^function/, `function ${typeof property.key !== "symbol" ? property.key : "configureRouter"}`);
      } else if (!/^function/.test(body)) {
        // symbol named functions become "functionName()" when calling .toString() on the value
        body = `function ${body}`;
      }
      const program = cw.parseScript(body) as cw.Program;
      for (const statementOrModuleDeclaration of program.body) {
        if (statementOrModuleDeclaration.type === "FunctionDeclaration") {
          return statementOrModuleDeclaration;
        }
      }
    }

    throw new Error();
  };
}

export function splitRouteConfig(configs: IRouteConfig[]): IRouteConfig[] {
  if (configs.length === 0) {
    return configs;
  }
  const result: IRouteConfig[][] = [];
  for (const config of configs) {
    if (Object.prototype.hasOwnProperty.call(config, "route")) {
      if (/String/.test(Object.prototype.toString.call(config.route))) {
        result.push([config]);
      } else if (Array.isArray(config.route)) {
        if (config.route.length === 0) {
          delete config.route;

          result.push([config]);
        } else {
          result.push(config.route.map(r => ({ ...config, route: r })));
        }
      } else {
        delete config.route;

        result.push([config]);
      }
    } else {
      result.push([config]);
    }
  }

  return result.reduce((prev, cur) => prev.concat(cur));
}

/**
 * Returns the "configureRouter" method from a class constructor or, if it's stored in a Symbol-keyed property
 * (meaning it's wrapped by a RouterResource), will return that Symbol-keyed backup instead (since that's where
 * we need the route information from)
 */
export const getConfigureRouterMethod: SelectProperties<$Constructor, $Property> = $constructor => {
  const $prototype = $constructor.$export.$prototype;
  const wrappedMethod = $prototype.$properties.filter((p: $Property) => p.key === RouterResource.originalConfigureRouterSymbol);
  if (wrappedMethod.length) {
    return wrappedMethod;
  }

  const plainMethod = $prototype.$properties.filter((p: $Property) => p.key === "configureRouter");
  if (plainMethod.length) {
    return plainMethod;
  }

  throw new Error();
};

/**
 * Returns a list of CallExpressions from a BlockStatement where the name of the invoked method
 * matches the provided name.
 *
 * Example: the name "map" would return all xxx.map() expressions from a function block.
 */
export const createBlockStatementCallExpressionCalleePropertyNameQuery: Construct<
  string,
  SelectProperties<cw.BlockStatement, cw.CallExpression>
> = name => blockStatement => {
  if (blockStatement.type !== "BlockStatement") {
    throw new Error("Wrong type passed to query");
  }

  const callExpressions: cw.CallExpression[] = [];
  for (const statement of blockStatement.body) {
    if (statement.type === "ExpressionStatement" && statement.expression.type === "CallExpression") {
      const callExpression = statement.expression as cw.CallExpression;
      if (callExpression.callee.type === "MemberExpression") {
        const $callee = callExpression.callee as cw.MemberExpression;
        if ($callee.property.type === "Identifier") {
          const property = $callee.property as cw.Identifier;
          if (property.name === name) {
            callExpressions.push(callExpression);
          }
        }
      }
    }
  }

  return callExpressions;
};

export const createCallExpressionArgumentTypeQuery: Construct<
  string[],
  SelectProperties<cw.CallExpression, cw.Expression | cw.SpreadElement>
> = typeNames => callExpression => {
  if (callExpression.type !== "CallExpression") {
    throw new Error("Wrong type passed to query");
  }

  return callExpression.arguments.filter((arg: cw.Expression | cw.SpreadElement) => typeNames.some((t: string) => arg.type === t));
};

export const createRouteConfigPropertyQuery: Construct<string[], SelectProperties<cw.ObjectExpression, cw.Property>> = propertyNames => {
  return objectExpression => {
    if (objectExpression.type !== "ObjectExpression") {
      throw new Error("Wrong type passed to query");
    }

    const properties: cw.Property[] = [];
    for (const prop of objectExpression.properties) {
      if (prop.type === "Property" && prop.key.type === "Identifier") {
        if (propertyNames.some((name: string) => name === (prop.key as cw.Identifier).name)) {
          properties.push(prop);
        }
      }
    }

    return properties;
  };
};

export const getLiteralArgumentValues: SelectProperties<cw.CallExpression, string | number | boolean | null> = callExpression => {
  if (callExpression.type !== "CallExpression") {
    throw new Error("Wrong type passed to query");
  }

  const args = callExpression.arguments.filter((arg: cw.Expression | cw.SpreadElement) => arg.type === "Literal") as cw.Literal[];

  return args.map((arg: cw.Literal) => arg.value);
};
