// tslint:disable
System.register(["./parser"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function parse(source, context, options) {
        let sourceFile = '';
        let Cherow;
        let delegate = null;
        if (!!options) {
            if (options.source)
                sourceFile = options.source;
            if (typeof options.delegate === 'function') {
                delegate = options.delegate;
                context |= 128 /* OptionsDelegate */;
            }
            if (options.plugins) {
                const key = options.plugins.join('/');
                Cherow = pluginClassCache[key];
                if (!Cherow) {
                    Cherow = parser_1.Parser;
                    for (const plugin of options.plugins) {
                        Cherow = plugin(Cherow);
                    }
                    pluginClassCache[key] = Cherow;
                }
                return new Cherow(source, delegate, sourceFile).parseProgram(context, options);
            }
        }
        return new parser_1.Parser(source, sourceFile, delegate).parseProgram(context, options);
    }
    var parser_1, pluginClassCache, parseScript, parseModule, version;
    return {
        setters: [
            function (parser_1_1) {
                parser_1 = parser_1_1;
            }
        ],
        execute: function () {
            exports_1("pluginClassCache", pluginClassCache = {});
            // https://tc39.github.io/ecma262/#sec-scripts
            exports_1("parseScript", parseScript = (source, options) => {
                return parse(source, 262144 /* TopLevel */, options);
            });
            // https://tc39.github.io/ecma262/#sec-modules
            exports_1("parseModule", parseModule = (source, options) => {
                return parse(source, 512 /* Strict */ | 1024 /* Module */ | 262144 /* TopLevel */, options);
            });
            exports_1("version", version = '__VERSION__');
        }
    };
});
//# sourceMappingURL=cherow.js.map