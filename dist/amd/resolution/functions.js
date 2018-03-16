define(["require", "exports", "../cherow/cherow"], function (require, exports, cherow_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // tslint:disable:max-classes-per-file
    /**
     * Function that simply wraps the provided value in a promise.
     */
    class PromisifyFunction {
        execute(result, _) {
            return Promise.resolve(result);
        }
    }
    exports.PromisifyFunction = PromisifyFunction;
    /**
     * Builder that will make sure the specified property name will always be an object.
     */
    class EnsureObjectPropertyFunction {
        constructor(propertyName) {
            this.propertyName = propertyName;
        }
        execute(result, _) {
            result[this.propertyName] = Object.assign({}, result[this.propertyName]);
            return result;
        }
    }
    exports.EnsureObjectPropertyFunction = EnsureObjectPropertyFunction;
    /**
     * Function that uses cherow to parse the body of the first function returned by the PropertyQuery,
     * and then returns the FunctionDeclaration out of the parsed result.
     */
    class FunctionBodyParser {
        constructor(query) {
            this.query = query;
        }
        execute(request) {
            for (const property of this.query.selectProperties(request)) {
                let body = property.descriptor.value.toString();
                // ensure we have a pattern "function functionName()" for the parser
                if (/^function *\(/.test(body)) {
                    // regular named functions become "function()" when calling .toString() on the value
                    body = body.replace(/^function/, `function ${typeof property.key !== "symbol" ? property.key : "configureRouter"}`);
                }
                else if (!/^function/.test(body)) {
                    // symbol named functions become "functionName()" when calling .toString() on the value
                    body = `function ${body}`;
                }
                const program = cherow_1.parseScript(body);
                for (const statementOrModuleDeclaration of program.body) {
                    if (statementOrModuleDeclaration.type === "FunctionDeclaration") {
                        return statementOrModuleDeclaration;
                    }
                }
            }
        }
    }
    exports.FunctionBodyParser = FunctionBodyParser;
    class RouteConfigSplitter {
        execute(configs) {
            if (configs.length === 0) {
                return configs;
            }
            const result = [];
            for (const config of configs) {
                if (Object.prototype.hasOwnProperty.call(config, "route")) {
                    if (/String/.test(Object.prototype.toString.call(config.route))) {
                        result.push([config]);
                    }
                    else if (Array.isArray(config.route)) {
                        if (config.route.length === 0) {
                            delete config.route;
                            result.push([config]);
                        }
                        else {
                            result.push(config.route.map(r => (Object.assign({}, config, { route: r }))));
                        }
                    }
                    else {
                        delete config.route;
                        result.push([config]);
                    }
                }
                else {
                    result.push([config]);
                }
            }
            return result.reduce((prev, cur) => prev.concat(cur));
        }
    }
    exports.RouteConfigSplitter = RouteConfigSplitter;
});
//# sourceMappingURL=functions.js.map