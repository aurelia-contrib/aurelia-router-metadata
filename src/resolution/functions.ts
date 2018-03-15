import { parseScript } from "../cherow/cherow";
import { Program } from "../cherow/estree";
import { IRouteConfig } from "../interfaces";
import { $Constructor } from "../model";
import { IBuilderContext, IFunction, IPropertyQuery } from "./interfaces";

// tslint:disable:max-classes-per-file

/**
 * Function that simply wraps the provided value in a promise.
 */
export class PromisifyFunction implements IFunction {
  public execute(result: any, _: IBuilderContext): any {
    return Promise.resolve(result);
  }
}

/**
 * Builder that will make sure the specified property name will always be an object.
 */
export class EnsureObjectPropertyFunction implements IFunction {
  public propertyName: string;

  constructor(propertyName: string) {
    this.propertyName = propertyName;
  }

  public execute(result: any, _: IBuilderContext): any {
    result[this.propertyName] = { ...result[this.propertyName] };

    return result;
  }
}

/**
 * Function that uses cherow to parse the body of the first function returned by the PropertyQuery,
 * and then returns the FunctionDeclaration out of the parsed result.
 */
export class FunctionBodyParser implements IFunction {
  public query: IPropertyQuery;
  constructor(query: IPropertyQuery) {
    this.query = query;
  }

  public execute(request: $Constructor): any {
    for (const property of this.query.selectProperties(request)) {
      let body = property.descriptor.value.toString();
      // ensure we have a pattern "function functionName()" for the parser
      if (/^function *\(/.test(body)) {
        // regular named functions become "function()" when calling .toString() on the value
        body = body.replace(
          /^function/,
          `function ${typeof property.key !== "symbol" ? property.key : "configureRouter"}`
        );
      } else if (!/^function/.test(body)) {
        // symbol named functions become "functionName()" when calling .toString() on the value
        body = `function ${body}`;
      }
      const program = parseScript(body) as Program;
      for (const statementOrModuleDeclaration of program.body) {
        if (statementOrModuleDeclaration.type === "FunctionDeclaration") {
          return statementOrModuleDeclaration;
        }
      }
    }
  }
}

export class RouteConfigSplitter implements IFunction {
  public execute(configs: IRouteConfig[]): IRouteConfig[] {
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
}
