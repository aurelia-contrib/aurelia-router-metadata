import { parseScript } from "../cherow/cherow";
import { Program } from "../cherow/estree";
import { $Constructor } from "../model";
import { IBuilderContext, IFunction, IPropertyQuery } from "./interfaces";

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
      const body = property.descriptor.value.toString();
      if (/^function/.test(body)) {
        // Function name is not captured when you .toString() it, so we restore
        // the original name here for the parser
        const namedFunctionBody = body.replace(/^function/, `function ${property.key}`);
        const program = parseScript(namedFunctionBody) as Program;
        for (const statementOrModuleDeclaration of program.body) {
          if (statementOrModuleDeclaration.type === "FunctionDeclaration") {
            return statementOrModuleDeclaration;
          }
        }
      }
    }
  }
}
