import { Container } from "aurelia-dependency-injection";
import * as cw from "cherow";
import {
  ICompleteRouteConfig,
  IConfigureRouterInstruction as IConfigInstruction,
  ICreateRouteConfigInstruction as ICreateInstruction,
  IRouteConfig,
  IRouterResourceTarget
} from "./interfaces";
import { $Constructor, $Module } from "./model";
import { Registry } from "./registry";
import { routerMetadata } from "./router-metadata";
import { RouterMetadataSettings } from "./router-metadata-configuration";
import { RouterResource } from "./router-resource";
import { ensureArray, splitRouteConfig } from "./util";

// tslint:disable:max-classes-per-file

/**
 * Class that creates RouteConfigs for the @routeConfig() decorator
 */
export abstract class RouteConfigFactory {
  public abstract createRouteConfigs(
    // tslint:disable-next-line:variable-name
    _instruction: ICreateInstruction
  ): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;

  public abstract createChildRouteConfigs(
    // tslint:disable-next-line:variable-name
    _instruction: ICreateInstruction
  ): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]>;
}

/**
 * The default RouteConfig factory
 */
export class DefaultRouteConfigFactory extends RouteConfigFactory {
  /**
   * Creates `RouteConfig` objects based an instruction for a class that can be navigated to
   *
   * @param instruction Instruction containing all information based on which the `RouteConfig` objects
   * will be created
   */
  public async createRouteConfigs(instruction: ICreateInstruction): Promise<ICompleteRouteConfig[]> {
    const resource = routerMetadata.getOrCreateOwn(instruction.target);
    await resource.load();

    return buildRouteConfigCollection(instruction);
  }

  /**
   * Creates `RouteConfig` objects based an instruction for a class that can navigate to others
   *
   * @param instruction Instruction containing all information based on which the `RouteConfig` objects
   * will be created
   */
  public async createChildRouteConfigs(instruction: IConfigInstruction): Promise<ICompleteRouteConfig[]> {
    const resource = routerMetadata.getOrCreateOwn(instruction.target);
    await resource.load();

    return buildCompleteChildRouteConfigCollection(instruction);
  }
}

const buildRouteConfigCollection = (
  instruction: ICreateInstruction
): ICompleteRouteConfig[] | Promise<ICompleteRouteConfig[]> | PromiseLike<ICompleteRouteConfig[]> => {
  const result: ICompleteRouteConfig[] = [];
  const defaults = getRouteConfigDefaults(instruction);
  const overrides = buildRouteConfigOverrides(instruction);
  const configs = ensureArray<IRouteConfig>(instruction.routes).concat(ensureArray(instruction.target.routes));
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
};

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

const getContainer = (x: Function | IRouterResourceTarget) => {
  if (x === Container) {
    return Container.instance;
  }
  const routerResource = routerMetadata.getOrCreateOwn(x);

  return (routerResource && routerResource.container) || Container.instance;
};

const getSettings = (x: ICreateInstruction) => {
  return x.settings ? x.settings : getContainer(x.target).get(RouterMetadataSettings);
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

function hyphenate(value: string): string {
  return (value.charAt(0).toLowerCase() + value.slice(1)).replace(/([A-Z])/g, (char: string) => `-${char.toLowerCase()}`);
}

function toTitle(value: string): string {
  return value.replace(/([A-Z])/g, (char: string) => ` ${char}`).trimLeft();
}

const buildCompleteChildRouteConfigCollection = (instruction: IConfigInstruction, $module?: $Module) => {
  let $constructor = $module && $module.$defaultExport && $module.$defaultExport.$constructor;
  if (!$constructor) {
    $constructor = getRegisteredConstructor(instruction.target);
  }

  const collection = buildChildRouteConfigCollection($constructor);

  return splitRouteConfig(collection) as ICompleteRouteConfig[];
};

const buildChildRouteConfigCollection = ($constructor: $Constructor) => {
  const results: IRouteConfig[] = [];

  const functionDeclaration = getConfigureRouterFunctionDeclaration($constructor);
  if (functionDeclaration) {
    let i = functionDeclaration.body.body.length;
    while (i--) {
      const statement = functionDeclaration.body.body[i];
      if (
        statement.type === "ExpressionStatement" &&
        statement.expression.type === "CallExpression" &&
        statement.expression.callee.type === "MemberExpression" &&
        statement.expression.callee.property.type === "Identifier" &&
        statement.expression.callee.property.name === "map"
      ) {
        const configCollection = getRouteConfigsFromMapCallExpression(statement.expression);
        let j = configCollection.length;
        while (j--) {
          const config = configCollection[j];
          if (Array.isArray(config.route)) {
            let k = config.route.length;
            while (k--) {
              const multiConfig: ICompleteRouteConfig = {} as any;
              mergeRouteConfig(multiConfig, config);
              multiConfig.route = config.route[k];
              results.push(multiConfig);
            }
          } else {
            results.push(config);
          }
        }
      }
    }
  }

  return results;
};

const getRegisteredConstructor = (target: IRouterResourceTarget): $Constructor => {
  const resource = routerMetadata.getOrCreateOwn(target);
  if (!resource) {
    throw new Error();
  }

  if (resource.$module && resource.$module.$defaultExport) {
    return resource.$module.$defaultExport.$constructor;
  } else if (resource.moduleId) {
    const registry = getContainer(target).get(Registry);
    const $module = registry.getModule(resource.moduleId);
    if ($module && $module.$defaultExport) {
      return $module.$defaultExport.$constructor;
    }
  }

  throw new Error();
};

const getRouteConfigsFromMapCallExpression = (callExpression: cw.ESTree.CallExpression) => {
  const results: IRouteConfig[] = [];

  let i = callExpression.arguments.length;
  while (i--) {
    const arg = callExpression.arguments[i];
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
  }

  return results;
};

const analyzeObjectExpression = (expression: cw.ESTree.ObjectExpression) => {
  const objectResult: { [key: string]: any } = {};
  let i = expression.properties.length;
  while (i--) {
    const prop = expression.properties[i];
    if (prop.type === "Property" && prop.key.type === "Identifier" && prop.value !== null) {
      switch (prop.value.type) {
        case "Literal":
          objectResult[prop.key.name] = prop.value.value;
          break;
        case "ArrayExpression":
          objectResult[prop.key.name] = [];
          let j = prop.value.elements.length;
          while (j--) {
            const el = prop.value.elements[j];
            if (el && el.type === "Literal") {
              objectResult[prop.key.name].push(el.value);
            }
          }
          break;
        case "ObjectExpression": {
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

const getConfigureRouterFunctionDeclaration = ($constructor: $Constructor) => {
  let configureRouterMethod = $constructor.$export.$prototype.$properties.find(p => p.key === RouterResource.originalConfigureRouterSymbol);
  if (!configureRouterMethod) {
    configureRouterMethod = $constructor.$export.$prototype.$properties.find(p => p.key === "configureRouter");
  }
  if (configureRouterMethod) {
    let body = configureRouterMethod.descriptor.value.toString();
    // ensure we have a pattern "function functionName()" for the parser
    if (/^function *\(/.test(body)) {
      // regular named functions become "function()" when calling .toString() on the value
      body = body.replace(/^function/, `function ${typeof configureRouterMethod.key !== "symbol" ? configureRouterMethod.key : "configureRouter"}`);
    } else if (!/^function/.test(body)) {
      // symbol named functions become "functionName()" when calling .toString() on the value
      body = `function ${body}`;
    }
    const program = cw.parseScript(body);
    let i = program.body.length;
    while (i--) {
      const statement = program.body[i];
      if (statement.type === "FunctionDeclaration") {
        return statement;
      }
    }
  }

  return null;
};
