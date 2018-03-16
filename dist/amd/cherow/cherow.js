// tslint:disable
define(["require", "exports", "./parser"], function (require, exports, parser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.pluginClassCache = {};
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
                Cherow = exports.pluginClassCache[key];
                if (!Cherow) {
                    Cherow = parser_1.Parser;
                    for (const plugin of options.plugins) {
                        Cherow = plugin(Cherow);
                    }
                    exports.pluginClassCache[key] = Cherow;
                }
                return new Cherow(source, delegate, sourceFile).parseProgram(context, options);
            }
        }
        return new parser_1.Parser(source, sourceFile, delegate).parseProgram(context, options);
    }
    // https://tc39.github.io/ecma262/#sec-scripts
    exports.parseScript = (source, options) => {
        return parse(source, 262144 /* TopLevel */, options);
    };
    // https://tc39.github.io/ecma262/#sec-modules
    exports.parseModule = (source, options) => {
        return parse(source, 512 /* Strict */ | 1024 /* Module */ | 262144 /* TopLevel */, options);
    };
    exports.version = '__VERSION__';
});
//# sourceMappingURL=cherow.js.map